import { shuffle } from "~/draft/helpers/randomization";
import { fisherYatesShuffle } from "~/stats";
import { DraftSettings, FactionId, Player, PlayerId } from "~/types";

export function createDraftOrder(
  players: Player[],
  settings: DraftSettings,
  availableFactions: FactionId[],
) {
  const playerIds = fisherYatesShuffle(
    players.map((p) => p.id),
    players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();
  const pickOrder = [...playerIds, ...reversedPlayerIds, ...playerIds];

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
      name: p.name.length > 0 ? p.name : `Player ${p.id + 1}`,
    })),
    pickOrder,
    playerFactionPool,
    selections: [],
  };
}
