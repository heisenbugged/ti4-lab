import { useMemo } from "react";
import { systemData } from "~/data/systemData";
import { useMapBuilder } from "~/mapBuilderStore";
import { Map, SystemStats } from "~/types";
import { systemStats } from "~/utils/system";

export function calculateMapStats(map: Map) {
  const stats: SystemStats[] = [];

  map.forEach((t) => {
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
      acc.totalLegendary += s.totalLegendary;

      // Count tech skips by type
      s.totalTech.forEach((tech) => {
        if (tech === "G") acc.bioticSkips++;
        if (tech === "R") acc.warfareSkips++;
        if (tech === "B") acc.propulsionSkips++;
        if (tech === "Y") acc.cyberneticSkips++;
      });

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
      totalLegendary: 0,
      redTraits: 0,
      greenTraits: 0,
      blueTraits: 0,
      bioticSkips: 0,
      warfareSkips: 0,
      propulsionSkips: 0,
      cyberneticSkips: 0,
    },
  );
}

export function useMapStats() {
  const map = useMapBuilder((state) => state.state.map);

  return useMemo(() => calculateMapStats(map), [map]);
}
