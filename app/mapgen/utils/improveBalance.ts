import { Map, SystemTile } from "~/types";
import { calculateSliceValue, getAllSliceValues, calculateBalanceGap } from "./sliceScoring";
import { systemData } from "~/data/systemData";
import { mapStringOrder } from "~/data/mapStringOrder";

const MILTY_6P_HOME_POSITIONS = [19, 22, 25, 28, 31, 34];

/**
 * Get adjacent tile indices
 */
function getAdjacentTileIndices(tileIdx: number, mapSize: number): number[] {
  if (tileIdx >= mapStringOrder.length) return [];

  const pos = mapStringOrder[tileIdx];
  const { x, y } = pos;

  const adjacentPositions = [
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y },
    { x: x, y: y - 1 },
  ];

  const adjacentIndices: number[] = [];
  for (let i = 0; i < Math.min(mapSize, mapStringOrder.length); i++) {
    const tilePos = mapStringOrder[i];
    if (
      adjacentPositions.some((adj) => adj.x === tilePos.x && adj.y === tilePos.y)
    ) {
      adjacentIndices.push(i);
    }
  }

  return adjacentIndices;
}

/**
 * Check if the entire map is legal
 */
function isMapLegal(map: Map): boolean {
  for (let i = 0; i < map.length; i++) {
    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const system = systemData[tile.systemId];
    if (!system) return false;

    const adjacentIndices = getAdjacentTileIndices(i, map.length);

    for (const adjIdx of adjacentIndices) {
      const adjTile = map[adjIdx];
      if (adjTile.type !== "SYSTEM") continue;

      const adjSystem = systemData[adjTile.systemId];

      // Check wormhole rule: same wormholes cannot be adjacent
      if (system.wormholes.length > 0 && adjSystem.wormholes.length > 0) {
        const hasMatchingWormhole = system.wormholes.some((wh) =>
          adjSystem.wormholes.includes(wh)
        );
        if (hasMatchingWormhole) return false;
      }

      // Check anomaly rule: anomalies cannot be adjacent
      if (system.anomalies.length > 0 && adjSystem.anomalies.length > 0) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Attempt to improve the balance gap by swapping two systems
 * Returns the improved map if successful, null otherwise
 */
export function improveBalance(map: Map): Map | null {
  // Get all eligible system positions (exclude Mecatol Rex at index 0 and HOME tiles)
  const eligibleSystemIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "SYSTEM" && tile.systemId !== "18" && idx !== 0) {
      eligibleSystemIndices.push(idx);
    }
  });

  // Shuffle to randomize which swap we try first
  const shuffledIndices = shuffle(eligibleSystemIndices);

  const currentBalanceGap = calculateBalanceGap(getAllSliceValues(map));

  // Try all pairs of systems
  for (let a = 0; a < shuffledIndices.length; a++) {
    for (let b = 0; b < shuffledIndices.length; b++) {
      if (a === b) continue;

      const idxA = shuffledIndices[a];
      const idxB = shuffledIndices[b];
      const tileA = map[idxA] as SystemTile;
      const tileB = map[idxB] as SystemTile;

      // Only swap if systems have different values
      if (tileA.systemId === tileB.systemId) continue;

      // Create new map with swapped systems
      const newMap = map.map((tile, idx) => {
        if (idx === idxA) {
          return { ...tile, systemId: tileB.systemId } as SystemTile;
        }
        if (idx === idxB) {
          return { ...tile, systemId: tileA.systemId } as SystemTile;
        }
        return tile;
      });

      // Check if new map is legal
      if (!isMapLegal(newMap)) continue;

      // Calculate new balance gap
      const newSliceValues = getAllSliceValues(newMap);
      const newBalanceGap = calculateBalanceGap(newSliceValues);

      // If balance improved, return the new map
      if (newBalanceGap < currentBalanceGap) {
        return newMap;
      }
    }
  }

  // No improvement found
  return null;
}
