import { Map as TiMap, SystemId, Anomaly } from "~/types";
import { systemData } from "~/data/systemData";
import {
  DEFAULT_SLICE_VALUE_MODIFIERS,
  evaluateSystem,
  SliceValueBreakdown,
  SliceValueModifier,
  SliceValueModifiers,
} from "~/stats";
import {
  buildHexGraph,
  getGraphDistance,
  getSimpleHexDistance,
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
 * Per-tile contribution data for hover visualization
 */
export type TileContribution = {
  tileIdx: number;
  fullValue: number;        // Value before equidistant division
  actualValue: number;      // Value after division
  equidistantCount: number; // Number of homes sharing (1 = full, 2+ = shared)
  percentage: number;       // 1 / equidistantCount (1.0, 0.5, 0.33, etc.)
};

type EvaluatedSystemContribution = {
  included: boolean;
  optimalResources: number;
  optimalInfluence: number;
  optimalFlex: number;
  modifiers: SliceValueModifier[];
  fullValue: number;
  actualValue: number;
  equidistantPenalty: number;
};

/** Baseline distance to Mecatol for bonus/penalty calculation */
export const BASELINE_PATH_TO_MECATOL = 3;

/** Value gained per tile the home is closer to Mecatol than the baseline */
export const PATH_TO_MECATOL_VALUE_PER_TILE = 3;

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
 * Build a graph for equidistant calculations where supernovas are impassable
 * and nebulas are dead-ends (enterable, but not pass-through).
 */
function buildEquidistantGraph(map: TiMap, baseGraph: HexGraph): HexGraph {
  const supernovaIndices = findAnomalyTiles(map, "SUPERNOVA");
  const nebulaIndices = findAnomalyTiles(map, "NEBULA");

  if (supernovaIndices.size === 0 && nebulaIndices.size === 0) {
    return baseGraph;
  }

  const blockedFrom = new Set<number>([...supernovaIndices, ...nebulaIndices]);
  const edges = new Map<number, Map<number, number>>();

  for (const [from, neighbors] of baseGraph.edges.entries()) {
    const newNeighbors = new Map<number, number>();

    // Supernovas and nebulas cannot be traversed through
    if (blockedFrom.has(from)) {
      edges.set(from, newNeighbors);
      continue;
    }

    for (const [to, cost] of neighbors.entries()) {
      // Supernovas are fully impassable - cannot enter
      if (supernovaIndices.has(to)) continue;
      newNeighbors.set(to, cost);
    }

    edges.set(from, newNeighbors);
  }

  return { edges };
}

/**
 * Full (unshared) value of a system for map-based slice scoring.
 */
function getSystemValue(
  systemId: SystemId,
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
): number {
  const system = systemData[systemId];
  if (!system) return 0;

  return evaluateSystem(system, modifiers).total;
}

/**
 * Evaluate how much one map tile contributes to one home system's slice.
 *
 * `evaluateSystem` handles the intrinsic value of the underlying system.
 * This wrapper adds the map-level rules:
 * - is the tile within distance 2 of this home?
 * - is another home closer?
 * - if multiple homes are equally close, how is the value split?
 *
 * That is why this function accepts the full `map` plus `homeIdx` / `homeIndices`,
 * while slice-based UI helpers can work from a precomputed array of systems.
 */
function evaluateSystemContribution(
  map: TiMap,
  tileIdx: number,
  homeIdx: number,
  homeIndices: number[],
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
  graph?: HexGraph,
): EvaluatedSystemContribution {
  const emptyResult: EvaluatedSystemContribution = {
    included: false,
    optimalResources: 0,
    optimalInfluence: 0,
    optimalFlex: 0,
    modifiers: [],
    fullValue: 0,
    actualValue: 0,
    equidistantPenalty: 0,
  };

  if (tileIdx === 0) return emptyResult;

  const tile = map[tileIdx];
  if (tile.type !== "SYSTEM") return emptyResult;

  const distance = getHexDistance(map, homeIdx, tileIdx, graph);
  if (distance === 0 || distance > 2) return emptyResult;

  const system = systemData[tile.systemId];
  if (!system) return emptyResult;

  // This function is map-aware rather than slice-aware: it decides whether the
  // current home actually owns this tile, based on distance from every home.
  const homeDistances = homeIndices
    .map((h) => getHexDistance(map, h, tileIdx, graph))
    .filter((d) => d <= 2);

  const minDistance = Math.min(...homeDistances);
  if (distance > minDistance) return emptyResult;

  // If multiple homes are tied for closest, each home only receives 1/N of the
  // system's full value. The breakdown still shows the undivided system rows.
  const equidistantDivisor = homeDistances.filter((d) => d === minDistance).length;
  const systemValue = evaluateSystem(system, modifiers);
  const systemModifiers = systemValue.modifiers.map((modifier) => ({
    ...modifier,
    equidistantShared: equidistantDivisor > 1 ? equidistantDivisor : undefined,
  }));

  const fullValue = systemValue.total;
  const actualValue = fullValue / equidistantDivisor;

  return {
    included: true,
    optimalResources: systemValue.optimal.resources,
    optimalInfluence: systemValue.optimal.influence,
    optimalFlex: systemValue.optimal.flex,
    modifiers: systemModifiers,
    fullValue,
    actualValue,
    equidistantPenalty:
      equidistantDivisor > 1 ? fullValue - actualValue : 0,
  };
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
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
  graph?: HexGraph,
  _ringCount?: number,
): number {
  void _ringCount;
  let totalValue = 0;
  const equidistantGraph = graph ? buildEquidistantGraph(map, graph) : undefined;

  for (let i = 0; i < map.length; i++) {
    totalValue += evaluateSystemContribution(
      map,
      i,
      homeIdx,
      homeIndices,
      modifiers,
      equidistantGraph,
    ).actualValue;
  }

  // Add path to Mecatol bonus/penalty (excluding paths through other home systems)
  // Build set of OTHER home indices to exclude (not current home)
  const otherHomeIndices = new Set(homeIndices.filter((h) => h !== homeIdx));

  // Build graph excluding other homes
  const graphExcludingHomes = buildHexGraph(map, { excludedIndices: otherHomeIndices });
  const pathToMecatol = getGraphDistance(graphExcludingHomes, homeIdx, 0);

  // Only add modifier if path is valid (not infinite)
  if (pathToMecatol !== Infinity) {
    // Base path bonus/penalty (compared to baseline of 3)
    const pathDifference = BASELINE_PATH_TO_MECATOL - pathToMecatol;
    totalValue += pathDifference * PATH_TO_MECATOL_VALUE_PER_TILE;

    // Check for supernova in ALL shortest paths
    const supernovaIndices = findAnomalyTiles(map, "SUPERNOVA");
    if (supernovaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...supernovaIndices]);
      const graphNoSupernova = buildHexGraph(map, { excludedIndices: excludeBoth });
      const pathWithoutSupernova = getGraphDistance(graphNoSupernova, homeIdx, 0);

      // If path is longer without supernova, all shortest paths have supernova
      if (pathWithoutSupernova > pathToMecatol) {
        totalValue += modifiers.supernovaOnPathPenalty;
      }
    }

    // Check for nebula in ALL shortest paths
    const nebulaIndices = findAnomalyTiles(map, "NEBULA");
    if (nebulaIndices.size > 0) {
      const excludeBoth = new Set([...otherHomeIndices, ...nebulaIndices]);
      const graphNoNebula = buildHexGraph(map, { excludedIndices: excludeBoth });
      const pathWithoutNebula = getGraphDistance(graphNoNebula, homeIdx, 0);

      // If path is longer without nebula, all shortest paths have nebula
      if (pathWithoutNebula > pathToMecatol) {
        totalValue += modifiers.nebulaOnPathPenalty;
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
  const equidistantGraph = graph ? buildEquidistantGraph(map, graph) : undefined;

  // Find all systems within 2 spaces (excluding Mecatol Rex at index 0)
  for (let i = 0; i < map.length; i++) {
    if (i === 0) continue; // Skip Mecatol Rex

    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const distance = getHexDistance(map, homeIdx, i, equidistantGraph);

    // Only count systems within 2 spaces (distance 1 and 2)
    if (distance === 0 || distance > 2) continue;

    // Find the minimum distance any home has to this tile
    const homeDistances = homeIndices
      .map((h) => getHexDistance(map, h, i, equidistantGraph))
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
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
  prebuiltGraph?: HexGraph,
  _ringCount?: number,
): Record<number, number> {
  void _ringCount;
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
    values[idx] = calculateSliceValue(map, idx, homeIndices, modifiers, graph, _ringCount);
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
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
  graph?: HexGraph,
  _ringCount?: number,
): SliceValueBreakdown {
  void _ringCount;
  let fullOptimalResources = 0;
  let fullOptimalInfluence = 0;
  let fullOptimalFlex = 0;
  let totalEquidistantPenalty = 0;
  const allModifiers: SliceValueModifier[] = [];
  let actualTotal = 0;
  const equidistantGraph = graph ? buildEquidistantGraph(map, graph) : undefined;

  for (let i = 0; i < map.length; i++) {
    const contribution = evaluateSystemContribution(
      map,
      i,
      homeIdx,
      homeIndices,
      modifiers,
      equidistantGraph,
    );
    if (!contribution.included) continue;

    fullOptimalResources += contribution.optimalResources;
    fullOptimalInfluence += contribution.optimalInfluence;
    fullOptimalFlex += contribution.optimalFlex;
    totalEquidistantPenalty += contribution.equidistantPenalty;
    actualTotal += contribution.actualValue;
    allModifiers.push(...contribution.modifiers);
  }

  // Calculate path to Mecatol modifier (excluding paths through other home systems)
  let pathToMecatolValue = 0;
  let supernovaPenalty = 0;
  let nebulaPenalty = 0;

  // Build set of OTHER home indices to exclude (not current home)
  const otherHomeIndices = new Set(homeIndices.filter((h) => h !== homeIdx));

  // Build graph excluding other homes
  const graphExcludingHomes = buildHexGraph(map, { excludedIndices: otherHomeIndices });
  const pathToMecatol = getGraphDistance(graphExcludingHomes, homeIdx, 0);

  // Only add modifier if path is valid (not infinite)
  if (pathToMecatol !== Infinity) {
    // Base path bonus/penalty (compared to baseline of 3)
    const pathDifference = BASELINE_PATH_TO_MECATOL - pathToMecatol;
    pathToMecatolValue = pathDifference * PATH_TO_MECATOL_VALUE_PER_TILE;

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
      const graphNoSupernova = buildHexGraph(map, { excludedIndices: excludeBoth });
      const pathWithoutSupernova = getGraphDistance(graphNoSupernova, homeIdx, 0);

      // If path is longer without supernova, all shortest paths have supernova
      if (pathWithoutSupernova > pathToMecatol) {
        supernovaPenalty = modifiers.supernovaOnPathPenalty;
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
      const graphNoNebula = buildHexGraph(map, { excludedIndices: excludeBoth });
      const pathWithoutNebula = getGraphDistance(graphNoNebula, homeIdx, 0);

      // If path is longer without nebula, all shortest paths have nebula
      if (pathWithoutNebula > pathToMecatol) {
        nebulaPenalty = modifiers.nebulaOnPathPenalty;
        allModifiers.push({
          label: "Nebula on Rex Path",
          value: nebulaPenalty,
        });
      }
    }
  }

  const fullOptimalSum =
    fullOptimalResources + fullOptimalInfluence + fullOptimalFlex;
  const total = Math.round((actualTotal + pathToMecatolValue + supernovaPenalty + nebulaPenalty) * 10) / 10;

  return {
    total,
    optimal: {
      resources: Math.round(fullOptimalResources * 10) / 10,
      influence: Math.round(fullOptimalInfluence * 10) / 10,
      flex: Math.round(fullOptimalFlex * 10) / 10,
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
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
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
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
): Record<number, Map<number, TileContribution>> {
  const contributions: Record<number, Map<number, TileContribution>> = {};

  // Build graph for hyperlane-aware distance calculations
  const graph = buildHexGraph(map);
  const equidistantGraph = buildEquidistantGraph(map, graph);

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
      const distance = getHexDistance(map, homeIdx, i, equidistantGraph);
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
