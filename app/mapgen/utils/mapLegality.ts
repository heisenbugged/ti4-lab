import { Map, SystemId } from "~/types";
import { systemData } from "~/data/systemData";
import { getAllNeighbors } from "~/utils/hexDistance";

/**
 * Check if two systems can legally be adjacent.
 * Rules:
 * - Same wormholes cannot be adjacent
 * - Anomalies cannot be adjacent to other anomalies
 */
export function areSystemsCompatibleAdjacent(
  systemIdA: SystemId,
  systemIdB: SystemId
): boolean {
  const systemA = systemData[systemIdA];
  const systemB = systemData[systemIdB];

  if (!systemA || !systemB) return true;

  // Check wormhole rule: same wormholes cannot be adjacent
  if (systemA.wormholes.length > 0 && systemB.wormholes.length > 0) {
    const hasMatchingWormhole = systemA.wormholes.some((wh) =>
      systemB.wormholes.includes(wh)
    );
    if (hasMatchingWormhole) return false;
  }

  // Check anomaly rule: anomalies cannot be adjacent
  if (systemA.anomalies.length > 0 && systemB.anomalies.length > 0) {
    return false;
  }

  return true;
}

/**
 * Check if placing a system at a tile index is legal.
 * Uses pre-computed adjacency map if provided for O(1) lookups.
 */
export function isPlacementLegal(
  map: Map,
  tileIdx: number,
  systemId: SystemId,
  adjacencyMap?: globalThis.Map<number, number[]>
): boolean {
  const system = systemData[systemId];
  if (!system) return false;

  const adjacentIndices = adjacencyMap
    ? adjacencyMap.get(tileIdx) ?? []
    : getAllNeighbors(map, tileIdx);

  for (const adjIdx of adjacentIndices) {
    const adjTile = map[adjIdx];
    if (adjTile.type !== "SYSTEM") continue;

    if (!areSystemsCompatibleAdjacent(systemId, adjTile.systemId)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the entire map is legal (no illegal adjacencies).
 */
export function isMapLegal(map: Map): boolean {
  for (let i = 0; i < map.length; i++) {
    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const adjacentIndices = getAllNeighbors(map, i);

    for (const adjIdx of adjacentIndices) {
      const adjTile = map[adjIdx];
      if (adjTile.type !== "SYSTEM") continue;

      if (!areSystemsCompatibleAdjacent(tile.systemId, adjTile.systemId)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Pre-compute adjacency map for O(1) lookups.
 */
export function buildAdjacencyMap(map: Map): globalThis.Map<number, number[]> {
  const adjacencyMap = new globalThis.Map<number, number[]>();

  for (let i = 0; i < map.length; i++) {
    adjacencyMap.set(i, getAllNeighbors(map, i));
  }

  return adjacencyMap;
}
