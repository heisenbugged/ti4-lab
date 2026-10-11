import { systemData } from "~/data/systemData";
import { Map, SystemIds, SystemStats } from "~/types";
import { systemStats } from "~/utils/system";

/**
 * Aggregate stats for every system in the given slices plus every system
 * placed on the map (excluding the center tile).
 */
export function calculateMapStats(slices: SystemIds[], map: Map) {
  const stats: SystemStats[] = [];
  slices.forEach((slice) => {
    slice.forEach((t) => {
      stats.push(systemStats(systemData[t]));
    });
  });
  map.forEach((t, idx) => {
    if (idx === 0) return;
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
