import {
  baseFactionIds,
  factionDiscordantExpIds,
  factionDiscordantIds,
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
  return factionPool.flat(1);
}
