import { shuffle } from "~/draft/helpers/randomization";
import { FactionId, Player, PlayerId } from "~/types";

/** Deals each player a random, non-overlapping bag of `bagSize` factions. */
export function dealFactionBags(
  players: Player[],
  factions: FactionId[],
  bagSize: number,
): Record<PlayerId, FactionId[]> {
  const available = shuffle(factions);
  return players.reduce<Record<PlayerId, FactionId[]>>((bags, player) => {
    bags[player.id] = available.splice(0, bagSize);
    return bags;
  }, {});
}
