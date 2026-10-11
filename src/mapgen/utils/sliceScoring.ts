import { Map as TiMap, Anomaly } from "~/types";
import { systemData } from "~/data/systemData";
import {
  DEFAULT_SLICE_VALUE_MODIFIERS,
  evaluateSystem,
  SliceValueBreakdown,
  SliceValueModifier,
  SliceValueModifiers,
} from "~/stats";
import { systemStats } from "~/utils/system";
import { buildHexGraph, getGraphDistance, HexGraph } from "~/utils/hexDistance";

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
 * Per-tile contribution data for hover visualization
 */
export type TileContribution = {
  tileIdx: number;
  fullValue: number; // Value before equidistant division
  actualValue: number; // Value after division
  equidistantCount: number; // Number of homes sharing (1 = full, 2+ = shared)
  percentage: number; // 1 / equidistantCount (1.0, 0.5, 0.33, etc.)
};

/** Baseline distance to Mecatol for bonus/penalty calculation */
const BASELINE_PATH_TO_MECATOL = 3;

/** Value gained per tile the home is closer to Mecatol than the baseline */
const PATH_TO_MECATOL_VALUE_PER_TILE = 3;

/** Anomalies that cost a slice value when every shortest path to Mecatol crosses one. */
const PATH_ANOMALY_PENALTIES: {
  anomaly: Anomaly;
  label: string;
  modifier: keyof SliceValueModifiers;
}[] = [
  {
    anomaly: "SUPERNOVA",
    label: "Supernova on Rex Path",
    modifier: "supernovaOnPathPenalty",
  },
  {
    anomaly: "NEBULA",
    label: "Nebula on Rex Path",
    modifier: "nebulaOnPathPenalty",
  },
];

/** Tile index -> the home indices tied for closest to it (within distance 2). */
type TileOwnership = Map<number, number[]>;

function getHomeIndices(map: TiMap): number[] {
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") homeIndices.push(idx);
  });
  return homeIndices;
}

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
 * Decide which homes own each system tile (excluding Mecatol Rex): a tile
 * belongs to the home(s) closest to it within distance 2. Homes tied for
 * closest share it, each receiving 1/N of its value.
 */
function getTileOwnership(
  map: TiMap,
  homeIndices: number[],
  graph: HexGraph,
): TileOwnership {
  const equidistantGraph = buildEquidistantGraph(map, graph);
  const ownership: TileOwnership = new Map();

  for (let i = 1; i < map.length; i++) {
    const tile = map[i];
    if (tile.type !== "SYSTEM" || !systemData[tile.systemId]) continue;

    const distances = homeIndices.map((h) =>
      getGraphDistance(equidistantGraph, h, i),
    );
    const inRange = distances.filter((d) => d > 0 && d <= 2);
    if (inRange.length === 0) continue;

    const minDistance = Math.min(...inRange);
    ownership.set(
      i,
      homeIndices.filter((_, h) => distances[h] === minDistance),
    );
  }

  return ownership;
}

/**
 * Bonus/penalty for the home's path to Mecatol (excluding paths through
 * other home systems), plus penalties when every shortest path crosses a
 * supernova or nebula.
 */
function mecatolPathModifiers(
  map: TiMap,
  homeIdx: number,
  homeIndices: number[],
): SliceValueModifier[] {
  const otherHomeIndices = new Set(homeIndices.filter((h) => h !== homeIdx));
  const pathToMecatol = getGraphDistance(
    buildHexGraph(map, { excludedIndices: otherHomeIndices }),
    homeIdx,
    0,
  );
  if (pathToMecatol === Infinity) return [];

  const modifiers: SliceValueModifier[] = [];
  const pathDifference = BASELINE_PATH_TO_MECATOL - pathToMecatol;
  if (pathDifference !== 0) {
    const direction = pathDifference > 0 ? "closer" : "further";
    modifiers.push({
      label: `Mecatol Path (${Math.abs(pathDifference)} ${direction})`,
      value: pathDifference * PATH_TO_MECATOL_VALUE_PER_TILE,
    });
  }

  for (const { anomaly, label, modifier } of PATH_ANOMALY_PENALTIES) {
    const anomalyIndices = findAnomalyTiles(map, anomaly);
    if (anomalyIndices.size === 0) continue;

    // If the path is longer without the anomaly, all shortest paths cross it
    const pathAvoidingAnomaly = getGraphDistance(
      buildHexGraph(map, {
        excludedIndices: new Set([...otherHomeIndices, ...anomalyIndices]),
      }),
      homeIdx,
      0,
    );
    if (pathAvoidingAnomaly > pathToMecatol) {
      modifiers.push({
        label,
        value: DEFAULT_SLICE_VALUE_MODIFIERS[modifier],
      });
    }
  }

  return modifiers;
}

/**
 * Breakdown of a home's slice value: every system it owns (distance 1 and 2
 * count equally, shared systems are divided between the tied homes) plus the
 * path to Mecatol modifiers. Base optimal and modifier rows show FULL
 * (undivided) values; the equidistant reduction is reported separately.
 */
function calculateSliceValueBreakdown(
  map: TiMap,
  homeIdx: number,
  homeIndices: number[],
  ownership: TileOwnership,
): SliceValueBreakdown {
  let fullOptimalResources = 0;
  let fullOptimalInfluence = 0;
  let fullOptimalFlex = 0;
  let totalEquidistantPenalty = 0;
  const allModifiers: SliceValueModifier[] = [];
  let total = 0;

  for (const [tileIdx, owners] of ownership) {
    if (!owners.includes(homeIdx)) continue;

    const tile = map[tileIdx];
    if (tile.type !== "SYSTEM") continue;

    const sharedBy = owners.length;
    const systemValue = evaluateSystem(systemData[tile.systemId]);
    const actualValue = systemValue.total / sharedBy;

    fullOptimalResources += systemValue.optimal.resources;
    fullOptimalInfluence += systemValue.optimal.influence;
    fullOptimalFlex += systemValue.optimal.flex;
    if (sharedBy > 1) {
      totalEquidistantPenalty += systemValue.total - actualValue;
    }
    total += actualValue;
    allModifiers.push(
      ...systemValue.modifiers.map((modifier) => ({
        ...modifier,
        equidistantShared: sharedBy > 1 ? sharedBy : undefined,
      })),
    );
  }

  for (const modifier of mecatolPathModifiers(map, homeIdx, homeIndices)) {
    total += modifier.value;
    allModifiers.push(modifier);
  }

  const fullOptimalSum =
    fullOptimalResources + fullOptimalInfluence + fullOptimalFlex;

  return {
    total: Math.round(total * 10) / 10,
    optimal: {
      resources: Math.round(fullOptimalResources * 10) / 10,
      influence: Math.round(fullOptimalInfluence * 10) / 10,
      flex: Math.round(fullOptimalFlex * 10) / 10,
      sum: Math.round(fullOptimalSum * 10) / 10,
    },
    equidistantPenalty:
      totalEquidistantPenalty > 0
        ? Math.round(totalEquidistantPenalty * 10) / 10
        : null,
    equidistantMultiplier: 1, // Set to 1 so popover doesn't show percentage (our system uses variable 1/N)
    modifiers: allModifiers,
  };
}

/**
 * Get all slice breakdowns from the map, keyed by home index.
 * Uses hyperlane-aware distance calculations.
 *
 * @param prebuiltGraph - Optional pre-built graph for performance when calling
 *                        this function multiple times with same hyperlane structure
 */
export function getAllSliceBreakdowns(
  map: TiMap,
  prebuiltGraph?: HexGraph,
): Record<number, SliceValueBreakdown> {
  const graph = prebuiltGraph ?? buildHexGraph(map);
  const homeIndices = getHomeIndices(map);
  const ownership = getTileOwnership(map, homeIndices, graph);

  const breakdowns: Record<number, SliceValueBreakdown> = {};
  homeIndices.forEach((idx) => {
    breakdowns[idx] = calculateSliceValueBreakdown(
      map,
      idx,
      homeIndices,
      ownership,
    );
  });
  return breakdowns;
}

/**
 * Get all home system values from the map, keyed by home index.
 */
export function getAllSliceValues(
  map: TiMap,
  prebuiltGraph?: HexGraph,
): Record<number, number> {
  const breakdowns = getAllSliceBreakdowns(map, prebuiltGraph);
  const values: Record<number, number> = {};
  for (const [idx, breakdown] of Object.entries(breakdowns)) {
    values[Number(idx)] = breakdown.total;
  }
  return values;
}

/**
 * Get detailed stats for each slice, keyed by home index.
 * Uses the same tile ownership as slice value (distance ≤2,
 * closest-home-wins) but counts shared tiles at full value.
 */
export function getAllSliceStats(map: TiMap): Record<number, SliceStats> {
  const homeIndices = getHomeIndices(map);
  const ownership = getTileOwnership(map, homeIndices, buildHexGraph(map));

  const stats: Record<number, SliceStats> = {};
  homeIndices.forEach((homeIdx) => {
    let resources = 0;
    let influence = 0;
    let optimalResources = 0;
    let optimalInfluence = 0;
    const techs = new Set<string>();
    let hazardous = 0;
    let industrial = 0;
    let cultural = 0;

    for (const [tileIdx, owners] of ownership) {
      if (!owners.includes(homeIdx)) continue;

      const tile = map[tileIdx];
      if (tile.type !== "SYSTEM") continue;

      const system = systemData[tile.systemId];
      const { optimalSpend } = system;
      const systemTotals = systemStats(system);

      resources += systemTotals.totalResources;
      influence += systemTotals.totalInfluence;
      optimalResources += optimalSpend.resources + optimalSpend.flex / 2;
      optimalInfluence += optimalSpend.influence + optimalSpend.flex / 2;
      systemTotals.totalTech.forEach((tech) => techs.add(tech));
      hazardous += systemTotals.redTraits;
      industrial += systemTotals.greenTraits;
      cultural += systemTotals.blueTraits;
    }

    stats[homeIdx] = {
      resources,
      influence,
      optimalResources,
      optimalInfluence,
      techs: [...techs].sort().join(""),
      traits: `${hazardous}/${industrial}/${cultural}`,
    };
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
 * Calculate per-tile contribution data for each home system.
 * Used for hover visualization to show which tiles contribute to a slice.
 * Returns a map of homeIdx -> Map<tileIdx, TileContribution>
 */
export function getAllTileContributions(
  map: TiMap,
): Record<number, Map<number, TileContribution>> {
  const homeIndices = getHomeIndices(map);
  const ownership = getTileOwnership(map, homeIndices, buildHexGraph(map));

  const contributions: Record<number, Map<number, TileContribution>> = {};
  homeIndices.forEach((idx) => (contributions[idx] = new Map()));

  for (const [tileIdx, owners] of ownership) {
    const tile = map[tileIdx];
    if (tile.type !== "SYSTEM") continue;

    const systemValue = evaluateSystem(systemData[tile.systemId]).total;
    if (systemValue === 0) continue;

    const equidistantCount = owners.length;
    const percentage = 1 / equidistantCount;
    const actualValue = systemValue * percentage;

    for (const homeIdx of owners) {
      contributions[homeIdx].set(tileIdx, {
        tileIdx,
        fullValue: systemValue,
        actualValue: Math.round(actualValue * 10) / 10,
        equidistantCount,
        percentage,
      });
    }
  }

  return contributions;
}
