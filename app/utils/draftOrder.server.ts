import { shuffle } from "~/draft/helpers/randomization";
import {
  DraftSettings,
  DraftPick,
  FactionId,
  Player,
  PlayerId,
  Draft,
  TexasDraftState,
} from "~/types";
import { getRingForIndex } from "~/utils/hexCoordinates";

type DraftOrderInput = {
  players: Player[];
  settings: DraftSettings;
  availableFactions: FactionId[];
  presetMap?: Draft["presetMap"];
  texasDraft?: TexasDraftState;
};

function generateSnakeOrder(baseOrder: PlayerId[], picks: number): PlayerId[] {
  const order: PlayerId[] = [];
  const reversed = [...baseOrder].reverse();
  for (let i = 0; i < picks; i++) {
    const round = Math.floor(i / baseOrder.length);
    const roundOrder = round % 2 === 0 ? baseOrder : reversed;
    order.push(roundOrder[i % baseOrder.length]);
  }
  return order;
}

function getTexasRingPickCounts(map: Draft["presetMap"]): number[] {
  const countsByRing = new Map<number, number>();

  map.forEach((tile) => {
    if (tile.type !== "OPEN") return;
    const ring = getRingForIndex(tile.idx);
    if (ring <= 0) return;
    countsByRing.set(ring, (countsByRing.get(ring) ?? 0) + 1);
  });

  return Array.from(countsByRing.entries())
    .sort(([a], [b]) => a - b)
    .map(([, count]) => count);
}

export function createDraftOrder({
  players,
  settings,
  availableFactions,
  presetMap,
  texasDraft,
}: DraftOrderInput) {
  const playerIds = shuffle(
    players.map((p) => p.id),
    players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();

  if (settings.draftGameMode === "twilightsFall") {
    const pickOrder: DraftPick[] = [
      ...playerIds,
      ...reversedPlayerIds,
      ...playerIds,
      { kind: "simultaneous", phase: "priorityValue" },
      { kind: "simultaneous", phase: "homeSystem" },
    ];

    return {
      players: players.map((p) => ({
        ...p,
        name: p.name.length > 0 ? p.name : `Player ${placeholderName[p.id]}`,
      })),
      pickOrder,
      playerFactionPool: undefined,
      selections: [],
    };
  }

  if (settings.draftGameMode === "texasStyle") {
    const seatOrder = texasDraft?.seatOrder ?? playerIds;
    const speakerId = texasDraft?.speakerId ?? seatOrder[0];
    const descendingSeatOrder = [
      speakerId,
      ...seatOrder.filter((id) => id !== speakerId).reverse(),
    ];

    let pickOrder: DraftPick[] = [];

    if (settings.modifiers?.banFactions) {
      const modifier = settings.modifiers.banFactions;
      for (let i = 0; i < modifier.numFactions; i++) {
        pickOrder.push(...descendingSeatOrder);
      }
    }

    pickOrder.push({ kind: "simultaneous", phase: "texasFaction" });
    pickOrder.push({ kind: "simultaneous", phase: "texasBlueKeep1" });
    pickOrder.push({ kind: "simultaneous", phase: "texasBlueKeep2" });
    pickOrder.push({ kind: "simultaneous", phase: "texasRedKeep" });

    if (presetMap) {
      const ringCounts = getTexasRingPickCounts(presetMap);
      ringCounts.forEach((count) => {
        pickOrder.push(...generateSnakeOrder(seatOrder, count));
      });
    }

    return {
      players: players.map((p) => ({
        ...p,
        name: p.name.length > 0 ? p.name : `Player ${placeholderName[p.id]}`,
      })),
      pickOrder,
      playerFactionPool: undefined,
      selections: [],
    };
  }

  // Normal draft flow
  let pickOrder: DraftPick[] = [...playerIds, ...reversedPlayerIds, ...playerIds];

  if (settings.modifiers?.banFactions) {
    const modifier = settings.modifiers.banFactions;
    const banOrder = [];
    const banPlayerIds = [...reversedPlayerIds];
    for (let i = 0; i < modifier.numFactions; i++) {
      banOrder.push(...banPlayerIds.reverse());
    }
    pickOrder = [...banOrder, ...pickOrder];
  }

  // Add stages to snake draft
  if (settings.draftSpeaker) {
    pickOrder.push(...playerIds.reverse());
  }
  if (
    settings.numMinorFactions !== undefined ||
    settings.minorFactionsInSharedPool
  ) {
    pickOrder.push(...playerIds.reverse());
  }
  if (settings.draftPlayerColors) {
    pickOrder.push(...playerIds.reverse());
  }

  // Create 'bags' for each player if using bag draft
  let playerFactionPool: Record<PlayerId, FactionId[]> | undefined = undefined;
  if (settings.numPreassignedFactions !== undefined) {
    playerFactionPool = {};
    const available = shuffle(availableFactions);
    players.forEach((player) => {
      const bag = available.splice(0, settings.numPreassignedFactions!);
      playerFactionPool![player.id] = bag;
    });
  }

  return {
    players: players.map((p) => ({
      ...p,
      name: p.name.length > 0 ? p.name : `Player ${placeholderName[p.id]}`,
    })),
    pickOrder,
    playerFactionPool,
    selections: [],
  };
}

const placeholderName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
