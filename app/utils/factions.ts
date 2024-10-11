import {
  baseFactionIds,
  factionDiscordantExpIds,
  factionDiscordantIds,
  factions,
  pokFactionIds,
} from "~/data/factionData";
import { FactionId, GameSet } from "~/types";

export function getFactionPool(sets: GameSet[]) {
  let factionPool: FactionId[] = [];
  if (sets.includes("base")) {
    factionPool.push(...baseFactionIds);
  }
  if (sets.includes("pok")) {
    factionPool.push(...pokFactionIds);
  }
  if (sets.includes("discordant")) {
    factionPool.push(...factionDiscordantIds);
  }
  if (sets.includes("discordantexp")) {
    factionPool.push(...factionDiscordantExpIds);
  }
  if (sets.includes("drahn")) {
    factionPool.push(factions.drahn.id);
  }
  return factionPool.flat(1);
}
