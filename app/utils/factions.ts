import {
  baseFactionIds,
  factionDiscordantExpIds,
  factionDiscordantIds,
  factions,
} from "~/data/factionData";
import { GameSet } from "~/types";

export function getFactionPool(sets: GameSet[]) {
  let factionPool = [...baseFactionIds];
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
