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
import { dealFactionBags } from "~/utils/factionBags";

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

/** `rounds` rounds of picks, alternating between `first` and `second`. */
function alternatingRounds(
  rounds: number,
  first: PlayerId[],
  second: PlayerId[],
): PlayerId[] {
  const order: PlayerId[] = [];
  for (let i = 0; i < rounds; i++) {
    order.push(...(i % 2 === 0 ? first : second));
  }
  return order;
}

function withPlaceholderNames(players: Player[]): Player[] {
  return players.map((p) => ({
    ...p,
    name: p.name.length > 0 ? p.name : `Player ${placeholderName[p.id]}`,
  }));
}

function draftOrderResult(
  players: Player[],
  pickOrder: DraftPick[],
  playerFactionPool?: Record<PlayerId, FactionId[]>,
) {
  return {
    players: withPlaceholderNames(players),
    pickOrder,
    playerFactionPool,
    selections: [],
  };
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
  const numBanRounds = settings.modifiers?.banFactions?.numFactions ?? 0;

  if (settings.draftGameMode === "twilightsFall") {
    // Nucleus with speaker draft adds three more snake rounds.
    const isNucleus = settings.nucleusStyle === true;
    const rounds = isNucleus && settings.draftSpeaker ? 6 : 3;
    const pickOrder: DraftPick[] = alternatingRounds(
      rounds,
      playerIds,
      reversedPlayerIds,
    );
    pickOrder.push({ kind: "simultaneous", phase: "priorityValue" });
    pickOrder.push({ kind: "simultaneous", phase: "homeSystem" });

    return draftOrderResult(players, pickOrder);
  }

  if (settings.draftGameMode === "texasStyle") {
    const seatOrder = texasDraft?.seatOrder ?? playerIds;
    const speakerId = texasDraft?.speakerId ?? seatOrder[0];
    const descendingSeatOrder = [
      speakerId,
      ...seatOrder.filter((id) => id !== speakerId).reverse(),
    ];

    const pickOrder: DraftPick[] = alternatingRounds(
      numBanRounds,
      descendingSeatOrder,
      descendingSeatOrder,
    );

    pickOrder.push({ kind: "simultaneous", phase: "texasFaction" });
    pickOrder.push({ kind: "simultaneous", phase: "texasBlueKeep1" });
    pickOrder.push({ kind: "simultaneous", phase: "texasBlueKeep2" });
    pickOrder.push({ kind: "simultaneous", phase: "texasRedKeep" });

    if (presetMap) {
      const ringCounts = getTexasRingPickCounts(presetMap);
      const totalTiles = ringCounts.reduce((sum, c) => sum + c, 0);
      pickOrder.push(...generateSnakeOrder(seatOrder, totalTiles));
    }

    return draftOrderResult(players, pickOrder);
  }

  // Ban rounds, then the three-round snake draft.
  const pickOrder: DraftPick[] = [
    ...alternatingRounds(numBanRounds, playerIds, reversedPlayerIds),
    ...alternatingRounds(3, playerIds, reversedPlayerIds),
  ];

  if (settings.draftGameMode === "presetMap") {
    return draftOrderResult(players, pickOrder);
  }

  // Each extra stage continues the snake; the third round ran forward, so the
  // first extra stage runs in reverse.
  const numExtraStages = [
    settings.draftSpeaker,
    settings.numMinorFactions !== undefined ||
      settings.minorFactionsInSharedPool,
    settings.draftPlayerColors,
  ].filter(Boolean).length;
  pickOrder.push(
    ...alternatingRounds(numExtraStages, reversedPlayerIds, playerIds),
  );

  // Create 'bags' for each player if using bag draft
  const playerFactionPool =
    settings.numPreassignedFactions !== undefined
      ? dealFactionBags(
          players,
          availableFactions,
          settings.numPreassignedFactions,
        )
      : undefined;

  return draftOrderResult(players, pickOrder, playerFactionPool);
}

const placeholderName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
