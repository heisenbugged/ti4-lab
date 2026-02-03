import {
  baseDraftableSystemIds,
  systemData,
  thunderSystemIds,
  unchartedStarsSystemIds,
  pokDraftableSystemIds,
} from "~/data/systemData";
import { GameSet, System, SystemId, SystemStats } from "~/types";
import { optimalStatsForSystems } from "~/utils/map";

const techSpecialtyMap = {
  BIOTIC: "G",
  CYBERNETIC: "Y",
  WARFARE: "R",
  PROPULSION: "B",
} as const;

const traitCount = {
  HAZARDOUS: "redTraits",
  INDUSTRIAL: "greenTraits",
  CULTURAL: "blueTraits",
} as const;

export function systemStats(system: System): SystemStats {
  return system.planets.reduce(
    (stats, p) => {
      stats.totalResources += p.resources;
      stats.totalInfluence += p.influence;

      if (p.tech) {
        for (const tech of p.tech) {
          stats.totalTech.push(techSpecialtyMap[tech]);
        }
      }

      if (p.trait) {
        for (const trait of p.trait) {
          stats[traitCount[trait]]++;
        }
      }

      if (p.legendary) {
        stats.totalLegendary++;
      }

      return stats;
    },
    {
      systemType: system.type,
      totalResources: 0,
      totalInfluence: 0,
      totalTech: [] as string[],
      redTraits: 0,
      greenTraits: 0,
      blueTraits: 0,
      totalLegendary: 0,
    },
  );
}

export function getSystemPool(sets: GameSet[]) {
  const systemPool = [...baseDraftableSystemIds];

  if (sets.includes("pok")) {
    systemPool.push(...pokDraftableSystemIds);
  }
  if (sets.includes("unchartedstars")) {
    systemPool.push(...unchartedStarsSystemIds);
  }

  // Thunder's Edge: IDs 92-149
  if (sets.includes("te")) {
    systemPool.push(...thunderSystemIds);
  }

  return systemPool;
}

export const systemsFromIds = (ids: SystemId[]): System[] =>
  ids.map((id) => systemData[id]);

// Calculate optimal constraints based on available systems
export function calculateOptimalConstraints(availableSystems: System[]) {
  const optimalValues = availableSystems.map((system) => {
    const optimal = optimalStatsForSystems([system]);
    return optimal.resources + optimal.influence + optimal.flex;
  });

  optimalValues.sort((a, b) => a - b);

  const miltySystemsPerSlice = 5;
  const miltyEqSystemsPerSlice = 4;

  // Calculate theoretical min/max for slices
  const miltyMinOptimal = optimalValues
    .slice(0, miltySystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);
  const miltyMaxOptimal = optimalValues
    .slice(-miltySystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);
  const miltyEqMinOptimal = optimalValues
    .slice(0, miltyEqSystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);
  const miltyEqMaxOptimal = optimalValues
    .slice(-miltyEqSystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);

  // Add some buffer for more realistic ranges
  const buffer = Math.max(
    1,
    Math.floor((miltyMaxOptimal - miltyMinOptimal) * 0.1),
  );

  return {
    miltyOptimalRange: {
      minOptimal: Math.max(0, miltyMinOptimal - buffer),
      maxOptimal: miltyMaxOptimal + buffer,
    },
    miltyEqOptimalRange: {
      minOptimal: Math.max(0, miltyEqMinOptimal - buffer),
      maxOptimal: miltyEqMaxOptimal + buffer,
    },
  };
}

// Calculate possible constraints for milty settings based on available game sets
export function calculateMiltyConstraints(gameSets: GameSet[]) {
  const systemPool = getSystemPool(gameSets);
  const availableSystems = systemPool.map((id) => systemData[id]);

  const alphaCount = availableSystems.filter((system) =>
    system.wormholes.includes("ALPHA"),
  ).length;

  const betaCount = availableSystems.filter((system) =>
    system.wormholes.includes("BETA"),
  ).length;

  const legendaryCount = availableSystems.filter((system) =>
    system.planets.some((planet) => planet.legendary),
  ).length;

  const optimalConstraints = calculateOptimalConstraints(availableSystems);

  return {
    maxAlphaWormholes: alphaCount,
    maxBetaWormholes: betaCount,
    maxLegendaries: legendaryCount,
    totalSystems: availableSystems.length,
    ...optimalConstraints,
  };
}
