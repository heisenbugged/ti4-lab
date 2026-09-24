import { Map, SystemId, Wormhole } from "~/types";
import { systemData } from "~/data/systemData";
import {
  getAllNeighbors,
  getGraphNeighbors,
  HexGraph,
} from "~/utils/hexDistance";

/**
 * Which adjacency rules to enforce. By default all rules apply; callers can
 * waive the anomaly rule or limit the wormhole rule to specific wormholes.
 */
export type AdjacencyRules = {
  anomalies: boolean;
  wormholes: readonly Wormhole[] | "all";
};

const ALL_RULES: AdjacencyRules = { anomalies: true, wormholes: "all" };

/**
 * Check if two systems can legally be adjacent.
 * Rules:
 * - Same wormholes cannot be adjacent
 * - Anomalies cannot be adjacent to other anomalies
 */
export function areSystemsCompatibleAdjacent(
  systemIdA: SystemId,
  systemIdB: SystemId,
  rules: AdjacencyRules = ALL_RULES,
): boolean {
  const systemA = systemData[systemIdA];
  const systemB = systemData[systemIdB];

  if (!systemA || !systemB) return true;

  // Check wormhole rule: same wormholes cannot be adjacent
  const hasMatchingWormhole = systemA.wormholes.some(
    (wh) =>
      systemB.wormholes.includes(wh) &&
      (rules.wormholes === "all" || rules.wormholes.includes(wh)),
  );
  if (hasMatchingWormhole) return false;

  // Check anomaly rule: anomalies cannot be adjacent
  if (
    rules.anomalies &&
    systemA.anomalies.length > 0 &&
    systemB.anomalies.length > 0
  ) {
    return false;
  }

  return true;
}

/**
 * Check if placing a system at a tile index is legal.
 * Uses pre-computed adjacency map if provided for O(1) lookups; otherwise
 * checks physical neighbors only.
 */
export function isPlacementLegal(
  map: Map,
  tileIdx: number,
  systemId: SystemId,
  adjacencyMap?: globalThis.Map<number, number[]>,
  rules: AdjacencyRules = ALL_RULES,
): boolean {
  const system = systemData[systemId];
  if (!system) return false;

  const adjacentIndices = adjacencyMap
    ? (adjacencyMap.get(tileIdx) ?? [])
    : getAllNeighbors(map, tileIdx);

  for (const adjIdx of adjacentIndices) {
    const adjTile = map[adjIdx];
    if (adjTile?.type !== "SYSTEM") continue;

    if (!areSystemsCompatibleAdjacent(systemId, adjTile.systemId, rules)) {
      return false;
    }
  }

  return true;
}

/**
 * Count illegal adjacency pairs on the map.
 */
export function countMapLegalityViolations(map: Map): number {
  let violations = 0;

  for (let i = 0; i < map.length; i++) {
    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const adjacentIndices = getAllNeighbors(map, i);

    for (const adjIdx of adjacentIndices) {
      if (adjIdx <= i) continue;

      const adjTile = map[adjIdx];
      if (adjTile.type !== "SYSTEM") continue;

      if (!areSystemsCompatibleAdjacent(tile.systemId, adjTile.systemId)) {
        violations++;
      }
    }
  }

  return violations;
}

/**
 * Pre-compute adjacency map for O(1) lookups.
 * With a graph, adjacency follows the graph (including hyperlane
 * connections); otherwise it is physical neighbors only.
 */
export function buildAdjacencyMap(
  map: Map,
  graph?: HexGraph,
): globalThis.Map<number, number[]> {
  const adjacencyMap = new globalThis.Map<number, number[]>();

  for (let i = 0; i < map.length; i++) {
    adjacencyMap.set(
      i,
      graph ? getGraphNeighbors(graph, i) : getAllNeighbors(map, i),
    );
  }

  return adjacencyMap;
}
