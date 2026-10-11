import { factions as allFactions } from "~/data/factionData";
import type { FactionId } from "~/types";

export function priorityOf(factionId: FactionId): number {
  return allFactions[factionId]?.priorityOrder ?? 999;
}

export function sortReferencePack(pack: FactionId[]): FactionId[] {
  return [...pack].sort((a, b) => priorityOf(a) - priorityOf(b));
}
