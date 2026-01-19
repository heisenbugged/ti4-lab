import { factions as allFactions } from "~/data/factionData";
import type { FactionId } from "~/types";

export function sortReferencePack(pack: FactionId[]): FactionId[] {
  return [...pack].sort((a, b) => {
    const factionA = allFactions[a];
    const factionB = allFactions[b];
    const priorityA = factionA?.priorityOrder ?? 999;
    const priorityB = factionB?.priorityOrder ?? 999;
    return priorityA - priorityB;
  });
}
