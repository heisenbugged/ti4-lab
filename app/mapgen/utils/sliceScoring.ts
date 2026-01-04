import { Map as TiMap, SystemId, Anomaly } from "~/types";
import { systemData } from "~/data/systemData";
import type {
  SliceValueBreakdown,
  SliceValueModifier,
} from "~/hooks/useSliceValueBreakdown";
import {
  buildHexGraph,
  buildHexGraphWithExclusions,
  getGraphDistance,
  getSimpleHexDistance,
  getAllNeighbors,
  HexGraph,
} from "~/utils/hexDistance";

/**
 * Simple slice scoring algorithm based on ti4-map-lab.
 * Calculates value of systems adjacent to each home system,
 * weighted by distance.
 */

export type SliceStats = {
  resources: number;
  influence: number;
  optimalResources: number; // Resources from R>I planets + half of flex (R=I) planets
  optimalInfluence: number; // Influence from I>R planets + half of flex (R=I) planets
  techs: string;
  traits: string;
};

/**
 * Get hex distance between two tiles.
 * If a HexGraph is provided, uses graph-based pathfinding (accounts for hyperlanes).
 * Otherwise, uses simple cube coordinate distance.
 */
function getHexDistance(map: TiMap, idx1: number, idx2: number, graph?: HexGraph): number {
  if (graph) {
    return getGraphDistance(graph, idx1, idx2);
  }
  return getSimpleHexDistance(map, idx1, idx2);
}

/**
 * Slice value modifiers (based on Milty draft defaults)
 */
export type SliceValueModifiers = {
  entropicScarValue: number;
  techValue: number;
  hopesEndValue: number;
  emelparValue: number;
  industrexValue: number;
  otherLegendaryValue: number;
  tradeStationValue: number;
  pathToMecatolPerTile: number;
  pathSupernovaPenalty: number;
  pathNebulaPenalty: number;
};

/**
 * Per-tile contribution data for hover visualization
 */
export type TileContribution = {
  tileIdx: number;
  fullValue: number;        // Value before equidistant division
  actualValue: number;      // Value after division
  equidistantCount: number; // Number of homes sharing (1 = full, 2+ = shared)
  percentage: number;       // 1 / equidistantCount (1.0, 0.5, 0.33, etc.)
};

export const DEFAULT_MODIFIERS: SliceValueModifiers = {
  entropicScarValue: 2,
  techValue: 0.5,
  hopesEndValue: 2,
  emelparValue: 3,
  industrexValue: 2,
  otherLegendaryValue: 1,
  tradeStationValue: 1,
  pathToMecatolPerTile: 3,
  pathSupernovaPenalty: -2,
  pathNebulaPenalty: -1,
};

/** Baseline distance to Mecatol for bonus/penalty calculation */
export const BASELINE_PATH_TO_MECATOL = 3;

/**
 * Find all tile indices containing a specific anomaly type.
 */
function findAnomalyTiles(map: TiMap, anomaly: Anomaly): Set<number> {
  const indices = new Set<number>();
  map.forEach((tile, idx) => {
    if (tile.type === "SYSTEM") {
      const system = systemData[tile.systemId];
      if (system?.anomalies.includes(anomaly)) {
        indices.add(idx);
      }
    }
  });
  return indices;
}

/**
 * Calculate simple value for a system (used for slice scoring)
 * Uses Milty draft modifiers for tech, legendaries, trade stations, etc.
 */
function getSystemValue(
  systemId: SystemId,
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
): number {
  const system = systemData[systemId];
  if (!system) return 0;

  let value = 0;

  // Use max of planet resources or influence (optimal resource type)
  system.planets.forEach((planet) => {
    value += Math.max(planet.resources, planet.influence);

    // Add bonus for tech specialties (0.5 per tech skip)
    if (planet.tech && planet.tech.length > 0) {
      value += planet.tech.length * modifiers.techValue;
    }

    // Add bonus for legendary planets (different values per legendary)
    if (planet.legendary) {
      if (planet.name === "Hope's End") {
        value += modifiers.hopesEndValue;
      } else if (planet.name === "Emelpar") {
        value += modifiers.emelparValue;
      } else if (planet.name === "Industrex") {
        value += modifiers.industrexValue;
      } else {
        value += modifiers.otherLegendaryValue;
      }
    }

    // Add bonus for trade stations
    if (planet.tradeStation) {
      value += modifiers.tradeStationValue;
    }
  });

  // Add bonus for entropic scar (system-level anomaly)
  if (system.anomalies.includes("ENTROPIC_SCAR")) {
    value += modifiers.entropicScarValue;
  }

  return value;
}

/**
 * Calculate the value of a slice (home system and adjacent systems)
 * Returns a score based on nearby system values (distance 1 and 2 count equally)
 * Tiles reachable by multiple homes are divided by the number of homes that can reach them
 * Uses Milty draft modifiers for tech, legendaries, trade stations, etc.
 * If graph is provided, uses hyperlane-aware distance calculations.
 * If ringCount is provided, adds bonus/penalty based on path distance to Mecatol.
 */
export function calculateSliceValue(
  map: TiMap,
  homeIdx: number,
  homeIndices: number[],
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
  graph?: HexGraph,
  ringCount?: number,
): number {
  let totalValue = 0;

  // Find all systems within 2 spaces (excluding Mecatol Rex at index 0)
  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue; // Skip Mecatol Rex - already accounted for in path bonus

    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const distance = getHexDistance(map, homeIdx, i, graph);

    // Only count systems within 2 spaces (distance 1 and 2)
    if (distance === 0 || distance > 2) continue;

    const systemValue = getSystemValue(tile.systemId, modifiers);

    // Find the minimum distance any home has to this tile
    const homeDistances = homeIndices
      .map((h) => getHexDistance(map, h, i, graph))
      .filter((d) => d <= 2);

    const minDistance = Math.min(...homeDistances);

    // Only count if we're at the minimum distance (closest home wins)
    if (distance > minDistance) continue;

    // Count homes at the minimum distance
    const homesAtMinDistance = homeDistances.filter((d) => d === minDistance).length;

    // Divide value by number of homes at minimum distance
    totalValue += systemValue / homesAtMinDistance;
  }

  // Add path to Mecatol bonus/penalty (excluding paths through other home systems)
  // Build set of OTHER home indices to exclude (not current home)
  const otherHomeIndices = new Set(homeIndices.filter((h) => h !== homeIdx));

  // Build graph excluding other homes
  const graphExcludingHomes = buildHexGraphWithExclusions(map, otherHomeIndices);
  const pathToMecatol = getGraphDistance(graphExcludingHomes, homeIdx, 0);

  // Only add modifier if path is valid (not infinite)
  if (pathToMecatol !== Infinity) {
    // Base path bonus/penalty (compared to baseline of 3)
    const pathDifference = BASELINE_PATH_TO_MECATOL - pathToMecatol;
    totalValue += pathDifference * modifiers.pathToMecatolPerTile;

    // Check for supernova in ALL shortest paths
    const supernovaIndices = findAnomalyTiles(map, "SUPERNOVA");
    if (supernovaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...supernovaIndices]);
      const graphNoSupernova = buildHexGraphWithExclusions(map, excludeBoth);
      const pathWithoutSupernova = getGraphDistance(graphNoSupernova, homeIdx, 0);

      // If path is longer without supernova, all shortest paths have supernova
      if (pathWithoutSupernova > pathToMecatol) {
        totalValue += modifiers.pathSupernovaPenalty;
      }
    }

    // Check for nebula in ALL shortest paths
    const nebulaIndices = findAnomalyTiles(map, "NEBULA");
    if (nebulaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...nebulaIndices]);
      const graphNoNebula = buildHexGraphWithExclusions(map, excludeBoth);
      const pathWithoutNebula = getGraphDistance(graphNoNebula, homeIdx, 0);

      // If path is longer without nebula, all shortest paths have nebula
      if (pathWithoutNebula > pathToMecatol) {
        totalValue += modifiers.pathNebulaPenalty;
      }
    }
  }

  return Math.round(totalValue * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate detailed stats for a slice.
 * Uses same tile selection as slice value: distance ≤2, closest-home-wins.
 * Does NOT apply equidistant penalties - shows full value of shared tiles.
 */
export function calculateSliceStats(
  map: TiMap,
  homeIdx: number,
  homeIndices: number[],
  graph?: HexGraph,
): SliceStats {
  let resources = 0;
  let influence = 0;
  let optimalResources = 0;
  let optimalInfluence = 0;
  const techs: string[] = [];
  let hazardous = 0;
  let industrial = 0;
  let cultural = 0;

  // Find all systems within 2 spaces (excluding Mecatol Rex at index 0)
  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue; // Skip Mecatol Rex

    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const distance = getHexDistance(map, homeIdx, i, graph);

    // Only count systems within 2 spaces (distance 1 and 2)
    if (distance === 0 || distance > 2) continue;

    // Find the minimum distance any home has to this tile
    const homeDistances = homeIndices
      .map((h) => getHexDistance(map, h, i, graph))
      .filter((d) => d <= 2);

    const minDistance = Math.min(...homeDistances);

    // Only count if we're at the minimum distance (closest home wins)
    // But do NOT divide for equidistant - count full value
    if (distance > minDistance) continue;

    const system = systemData[tile.systemId];
    if (!system) continue;

    system.planets.forEach((planet) => {
      resources += planet.resources;
      influence += planet.influence;

      // Optimal spend: R>I goes to resources, I>R goes to influence, R=I splits 50/50
      if (planet.resources > planet.influence) {
        optimalResources += planet.resources;
      } else if (planet.influence > planet.resources) {
        optimalInfluence += planet.influence;
      } else {
        // Flex planet (R = I): split evenly
        optimalResources += planet.resources / 2;
        optimalInfluence += planet.influence / 2;
      }

      // Track tech specialties
      if (planet.tech) {
        planet.tech.forEach((tech) => {
          const techAbbr =
            tech === "BIOTIC"
              ? "G"
              : tech === "WARFARE"
                ? "R"
                : tech === "PROPULSION"
                  ? "B"
                  : tech === "CYBERNETIC"
                    ? "Y"
                    : "";
          if (techAbbr && !techs.includes(techAbbr)) {
            techs.push(techAbbr);
          }
        });
      }

      // Track traits
      if (planet.trait) {
        planet.trait.forEach((trait) => {
          if (trait === "HAZARDOUS") hazardous++;
          if (trait === "INDUSTRIAL") industrial++;
          if (trait === "CULTURAL") cultural++;
        });
      }
    });
  }

  return {
    resources,
    influence,
    optimalResources,
    optimalInfluence,
    techs: techs.sort().join(""),
    traits: `${hazardous}/${industrial}/${cultural}`,
  };
}

/**
 * Get all home system values from the map
 * Builds a hex graph for hyperlane-aware distance calculations.
 *
 * @param prebuiltGraph - Optional pre-built graph for performance when calling
 *                        this function multiple times with same hyperlane structure
 * @param ringCount - Optional ring count for path to Mecatol bonus/penalty
 */
export function getAllSliceValues(
  map: TiMap,
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
  prebuiltGraph?: HexGraph,
  ringCount?: number,
): Record<number, number> {
  const values: Record<number, number> = {};

  // Use pre-built graph or build one
  const graph = prebuiltGraph ?? buildHexGraph(map);

  // First, collect all home indices
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") {
      homeIndices.push(idx);
    }
  });

  // Then calculate each slice value with equidistant logic
  homeIndices.forEach((idx) => {
    values[idx] = calculateSliceValue(map, idx, homeIndices, modifiers, graph, ringCount);
  });

  return values;
}

/**
 * Get all slice stats from the map.
 * Uses hyperlane-aware distance calculations.
 */
export function getAllSliceStats(map: TiMap): Record<number, SliceStats> {
  const stats: Record<number, SliceStats> = {};

  // Build graph for hyperlane-aware distance calculations
  const graph = buildHexGraph(map);

  // First, collect all home indices
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") {
      homeIndices.push(idx);
    }
  });

  // Then calculate each slice stats with closest-home-wins logic
  homeIndices.forEach((idx) => {
    stats[idx] = calculateSliceStats(map, idx, homeIndices, graph);
  });

  return stats;
}

/**
 * Calculate the balance gap (difference between highest and lowest slice values)
 */
export function calculateBalanceGap(
  sliceValues: Record<number, number>,
): number {
  const values = Object.values(sliceValues);
  if (values.length === 0) return 0;

  const max = Math.max(...values);
  const min = Math.min(...values);

  return Math.round((max - min) * 10) / 10;
}

/**
 * Calculate detailed breakdown of a slice value for tooltip display
 * Shows FULL (undivided) values for base optimal and modifiers,
 * with equidistant penalty shown separately as the reduction amount.
 * If graph is provided, uses hyperlane-aware distance calculations.
 * If ringCount is provided, includes path to Mecatol bonus/penalty.
 */
export function calculateSliceValueBreakdown(
  map: TiMap,
  homeIdx: number,
  homeIndices: number[],
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
  graph?: HexGraph,
  ringCount?: number,
): SliceValueBreakdown {
  // Track FULL (undivided) values for display
  let fullOptimalResources = 0;
  let fullOptimalInfluence = 0;
  let totalEquidistantPenalty = 0;

  const allModifiers: SliceValueModifier[] = [];
  let techSkipCount = 0;
  let fullTechSkipValue = 0;

  // Also track actual (divided) values for the total
  let actualTotal = 0;

  // Find all systems within 2 spaces (excluding Mecatol Rex at index 0)
  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue; // Skip Mecatol Rex - already accounted for in path bonus

    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const distance = getHexDistance(map, homeIdx, i, graph);
    if (distance === 0 || distance > 2) continue;

    const system = systemData[tile.systemId];
    if (!system) continue;

    // Find the minimum distance any home has to this tile
    const homeDistances = homeIndices
      .map((h) => getHexDistance(map, h, i, graph))
      .filter((d) => d <= 2);

    const minDistance = Math.min(...homeDistances);

    // Only count if we're at the minimum distance (closest home wins)
    if (distance > minDistance) continue;

    // Count homes at the minimum distance
    const homesAtMinDistance = homeDistances.filter((d) => d === minDistance).length;
    const equidistantDivisor = homesAtMinDistance;

    // Calculate optimal spend for this system (FULL values)
    let sysOptimal = 0;
    system.planets.forEach((planet) => {
      const optimal = Math.max(planet.resources, planet.influence);
      sysOptimal += optimal;
      // Track resources vs influence for breakdown (FULL values)
      if (planet.resources >= planet.influence) {
        fullOptimalResources += planet.resources;
      } else {
        fullOptimalInfluence += planet.influence;
      }
    });

    // Track modifiers (FULL values for display)
    let systemModifiersValue = 0;

    // Tech specialties
    system.planets.forEach((planet) => {
      if (planet.tech && planet.tech.length > 0) {
        techSkipCount += planet.tech.length;
        fullTechSkipValue += planet.tech.length * modifiers.techValue;
      }

      // Legendary planets
      if (planet.legendary) {
        let legValue = modifiers.otherLegendaryValue;
        let legLabel = planet.name || "Legendary";
        if (planet.name === "Hope's End") {
          legValue = modifiers.hopesEndValue;
        } else if (planet.name === "Emelpar") {
          legValue = modifiers.emelparValue;
        } else if (planet.name === "Industrex") {
          legValue = modifiers.industrexValue;
        }
        allModifiers.push({
          label: legLabel,
          value: legValue, // FULL value
          equidistantShared: equidistantDivisor > 1 ? equidistantDivisor : undefined,
        });
        systemModifiersValue += legValue;
      }

      // Trade stations
      if (planet.tradeStation) {
        allModifiers.push({
          label: "Trade Station",
          value: modifiers.tradeStationValue, // FULL value
          equidistantShared: equidistantDivisor > 1 ? equidistantDivisor : undefined,
        });
        systemModifiersValue += modifiers.tradeStationValue;
      }
    });

    // Entropic scar
    if (system.anomalies.includes("ENTROPIC_SCAR")) {
      allModifiers.push({
        label: "Entropic Scar",
        value: modifiers.entropicScarValue, // FULL value
        equidistantShared: equidistantDivisor > 1 ? equidistantDivisor : undefined,
      });
      systemModifiersValue += modifiers.entropicScarValue;
    }

    // Calculate equidistant penalty for this system
    const fullSystemValue = sysOptimal + systemModifiersValue;
    const actualSystemValue = fullSystemValue / equidistantDivisor;
    actualTotal += actualSystemValue;

    if (equidistantDivisor > 1) {
      totalEquidistantPenalty += fullSystemValue - actualSystemValue;
    }
  }

  // Add combined tech skip modifier if any (FULL value)
  if (techSkipCount > 0) {
    allModifiers.unshift({
      label: "Tech",
      value: fullTechSkipValue,
      count: techSkipCount,
    });
  }

  // Calculate path to Mecatol modifier (excluding paths through other home systems)
  let pathToMecatolValue = 0;
  let supernovaPenalty = 0;
  let nebulaPenalty = 0;

  // Build set of OTHER home indices to exclude (not current home)
  const otherHomeIndices = new Set(homeIndices.filter((h) => h !== homeIdx));

  // Build graph excluding other homes
  const graphExcludingHomes = buildHexGraphWithExclusions(map, otherHomeIndices);
  const pathToMecatol = getGraphDistance(graphExcludingHomes, homeIdx, 0);

  // Only add modifier if path is valid (not infinite)
  if (pathToMecatol !== Infinity) {
    // Base path bonus/penalty (compared to baseline of 3)
    const pathDifference = BASELINE_PATH_TO_MECATOL - pathToMecatol;
    pathToMecatolValue = pathDifference * modifiers.pathToMecatolPerTile;

    if (pathDifference !== 0) {
      const direction = pathDifference > 0 ? "closer" : "further";
      const tiles = Math.abs(pathDifference);
      allModifiers.push({
        label: `Mecatol Path (${tiles} ${direction})`,
        value: pathToMecatolValue,
      });
    }

    // Check for supernova in ALL shortest paths
    const supernovaIndices = findAnomalyTiles(map, "SUPERNOVA");
    if (supernovaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...supernovaIndices]);
      const graphNoSupernova = buildHexGraphWithExclusions(map, excludeBoth);
      const pathWithoutSupernova = getGraphDistance(graphNoSupernova, homeIdx, 0);

      // If path is longer without supernova, all shortest paths have supernova
      if (pathWithoutSupernova > pathToMecatol) {
        supernovaPenalty = modifiers.pathSupernovaPenalty;
        allModifiers.push({
          label: "Supernova on Rex Path",
          value: supernovaPenalty,
        });
      }
    }

    // Check for nebula in ALL shortest paths
    const nebulaIndices = findAnomalyTiles(map, "NEBULA");
    if (nebulaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...nebulaIndices]);
      const graphNoNebula = buildHexGraphWithExclusions(map, excludeBoth);
      const pathWithoutNebula = getGraphDistance(graphNoNebula, homeIdx, 0);

      // If path is longer without nebula, all shortest paths have nebula
      if (pathWithoutNebula > pathToMecatol) {
        nebulaPenalty = modifiers.pathNebulaPenalty;
        allModifiers.push({
          label: "Nebula on Rex Path",
          value: nebulaPenalty,
        });
      }
    }
  }

  const fullOptimalSum = fullOptimalResources + fullOptimalInfluence;
  const fullModifiersSum = allModifiers.reduce((sum, m) => sum + m.value, 0);
  const total = Math.round((actualTotal + pathToMecatolValue + supernovaPenalty + nebulaPenalty) * 10) / 10;

  return {
    total,
    optimal: {
      resources: Math.round(fullOptimalResources * 10) / 10,
      influence: Math.round(fullOptimalInfluence * 10) / 10,
      flex: 0,
      sum: Math.round(fullOptimalSum * 10) / 10,
    },
    equidistantPenalty: totalEquidistantPenalty > 0 ? Math.round(totalEquidistantPenalty * 10) / 10 : null,
    equidistantMultiplier: 1, // Set to 1 so popover doesn't show percentage (our system uses variable 1/N)
    modifiers: allModifiers,
  };
}

/**
 * Get all slice breakdowns from the map
 * Builds a hex graph for hyperlane-aware distance calculations.
 * @param ringCount - Optional ring count for path to Mecatol bonus/penalty
 */
export function getAllSliceBreakdowns(
  map: TiMap,
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
  ringCount?: number,
): Record<number, SliceValueBreakdown> {
  const breakdowns: Record<number, SliceValueBreakdown> = {};

  // Build graph for hyperlane-aware distance calculations
  const graph = buildHexGraph(map);

  // First, collect all home indices
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") {
      homeIndices.push(idx);
    }
  });

  // Then calculate each slice breakdown
  homeIndices.forEach((idx) => {
    breakdowns[idx] = calculateSliceValueBreakdown(map, idx, homeIndices, modifiers, graph, ringCount);
  });

  return breakdowns;
}

/**
 * Calculate per-tile contribution data for each home system.
 * Used for hover visualization to show which tiles contribute to a slice.
 * Returns a map of homeIdx -> Map<tileIdx, TileContribution>
 */
export function getAllTileContributions(
  map: TiMap,
  modifiers: SliceValueModifiers = DEFAULT_MODIFIERS,
): Record<number, Map<number, TileContribution>> {
  const contributions: Record<number, Map<number, TileContribution>> = {};

  // Build graph for hyperlane-aware distance calculations
  const graph = buildHexGraph(map);

  // Collect all home indices
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") {
      homeIndices.push(idx);
      contributions[idx] = new Map();
    }
  });

  // For each tile, calculate which homes it contributes to (excluding Mecatol Rex)
  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue; // Skip Mecatol Rex - already accounted for in path bonus

    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const systemValue = getSystemValue(tile.systemId, modifiers);
    if (systemValue === 0) continue;

    // Find which homes can reach this tile within distance 2
    const homeDistancePairs: { homeIdx: number; distance: number }[] = [];
    for (const homeIdx of homeIndices) {
      const distance = getHexDistance(map, homeIdx, i, graph);
      if (distance > 0 && distance <= 2) {
        homeDistancePairs.push({ homeIdx, distance });
      }
    }

    if (homeDistancePairs.length === 0) continue;

    // Find minimum distance
    const minDistance = Math.min(...homeDistancePairs.map((p) => p.distance));

    // Only homes at minimum distance get credit
    const homesAtMinDistance = homeDistancePairs.filter((p) => p.distance === minDistance);
    const equidistantCount = homesAtMinDistance.length;
    const percentage = 1 / equidistantCount;
    const actualValue = systemValue * percentage;

    // Add contribution to each home at minimum distance
    for (const { homeIdx } of homesAtMinDistance) {
      contributions[homeIdx].set(i, {
        tileIdx: i,
        fullValue: systemValue,
        actualValue: Math.round(actualValue * 10) / 10,
        equidistantCount,
        percentage,
      });
    }
  }

  return contributions;
}
