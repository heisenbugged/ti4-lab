import { useMemo } from "react";
import { systemData } from "~/data/systemData";
import { useDraft } from "~/draftStore";
import { Map, Slice, SystemStats } from "~/types";
import { systemStats } from "~/utils/system";

// TODO: Move to new file
export function calculateMapStats(slices: Slice[], presetMap: Map) {
  const stats: SystemStats[] = [];
  slices.forEach((slice) => {
    slice.tiles.forEach((t) => {
      if (t.type !== "SYSTEM") return;
      stats.push(systemStats(systemData[t.systemId]));
    });
  });
  presetMap.forEach((t) => {
    if (t.type !== "SYSTEM") return;
    stats.push(systemStats(systemData[t.systemId]));
  });

  return stats.reduce(
    (acc, s) => {
      acc.totalResources += s.totalResources;
      acc.totalInfluence += s.totalInfluence;
      acc.totalTech = acc.totalTech.concat(s.totalTech).sort();
      acc.redTraits += s.redTraits;
      acc.greenTraits += s.greenTraits;
      acc.blueTraits += s.blueTraits;

      if (s.systemType === "RED") {
        acc.redTiles++;
      } else if (s.systemType === "BLUE") {
        acc.blueTiles++;
      }

      return acc;
    },
    {
      redTiles: 0,
      blueTiles: 0,
      totalResources: 0,
      totalInfluence: 0,
      totalTech: [] as string[],
      redTraits: 0,
      greenTraits: 0,
      blueTraits: 0,
    },
  );
}

export function useFullMapStats() {
  const slices = useDraft((state) => state.draft.slices);
  const presetMap = useDraft((state) => state.draft.presetMap);

  return useMemo(
    () => calculateMapStats(slices, presetMap),
    [slices, presetMap],
  );
}
