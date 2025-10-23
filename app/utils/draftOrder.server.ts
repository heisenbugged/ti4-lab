import { shuffle } from "~/draft/helpers/randomization";
import { DraftSettings, FactionId, Player, PlayerId } from "~/types";

export function createDraftOrder(
  players: Player[],
  settings: DraftSettings,
  availableFactions: FactionId[],
) {
  const playerIds = shuffle(
    players.map((p) => p.id),
    players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();

  // Twilight's Fall: slice → reference card → faction (no seat, no speaker)
  if (settings.isTwilightsFall) {
    const pickOrder = [
      ...playerIds,           // Round 1: Select slice
      ...reversedPlayerIds,   // Round 1 reverse
      ...playerIds,           // Round 2: Select reference card
      ...reversedPlayerIds,   // Round 2 reverse
      ...playerIds,           // Round 3: Select faction
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

  // Normal draft flow
  let pickOrder = [...playerIds, ...reversedPlayerIds, ...playerIds];

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
