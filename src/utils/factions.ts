import {
  baseFactionIds,
  factionDiscordantExpIds,
  factionDiscordantIds,
  factions,
  pokFactionIds,
  teFactionIds,
  twilightsFallFactionIds,
} from "~/data/factionData";
import { FactionId, GameSet } from "~/types";

export function getFactionPool(sets: GameSet[]) {
  const factionPool: FactionId[] = [];
  if (sets.includes("base")) {
    factionPool.push(...baseFactionIds);
  }
  if (sets.includes("pok")) {
    factionPool.push(...pokFactionIds);
  }
  if (sets.includes("te")) {
    factionPool.push(...teFactionIds);
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
  if (sets.includes("twilightsFall")) {
    factionPool.push(...twilightsFallFactionIds);
  }
  return factionPool.flat(1);
}
