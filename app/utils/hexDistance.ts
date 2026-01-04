import { Map as TiMap, SystemTile } from "~/types";
import { systemData } from "~/data/systemData";

/**
 * Hex graph for pathfinding with hyperlane support.
 * Edges map: position -> (neighbor position -> cost)
 *
 * Cost model (destination-based):
 * - Moving TO a hyperlane tile = 0 cost (entering the hyperlane network is free)
 * - Moving TO a non-hyperlane tile = 1 cost (arriving at a system/home)
 *
 * This means chains of hyperlanes can be traversed for free, but exiting costs 1.
 * Example: Home → Hyperlane → Hyperlane → System = 0 + 0 + 1 = 1 total
 */
export type HexGraph = {
  edges: Map<number, Map<number, number>>;
};

/**
 * The 6 neighbor direction offsets in cube coordinates.
 * Index corresponds to hex side number (0-5) as used in hyperlane rendering.
 * Hex vertices start at angle 0 (East) and go counterclockwise.
 * Sides are midpoints between consecutive vertices.
 */
const DIRECTION_OFFSETS = [
  { x: 0, y: -1, z: 1 },  // Side 0: North
  { x: 1, y: -1, z: 0 },  // Side 1: Northeast
  { x: 1, y: 0, z: -1 },  // Side 2: Southeast
  { x: 0, y: 1, z: -1 },  // Side 3: South
  { x: -1, y: 1, z: 0 },  // Side 4: Southwest
  { x: -1, y: 0, z: 1 },  // Side 5: Northwest
];

/**
 * Get the neighbor position index for a given position and direction.
 * Uses tile positions from the map instead of external lookup.
 * Returns -1 if no neighbor exists at that position.
 */
function getNeighborAtDirection(map: TiMap, position: number, direction: number): number {
  const tile = map[position];
  if (!tile?.position) return -1;

  const pos = tile.position;
  const offset = DIRECTION_OFFSETS[direction];

  const neighborX = pos.x + offset.x;
  const neighborY = pos.y + offset.y;
  // For cube coordinates, z = -x - y
  const neighborZ = -neighborX - neighborY;

  // Find this position in the map
  for (let i = 0; i < map.length; i++) {
    const p = map[i]?.position;
    if (!p) continue;
    const pZ = -p.x - p.y;
    if (p.x === neighborX && p.y === neighborY && pZ === neighborZ) {
      return i;
    }
  }

  return -1;
}

/**
 * Get all 6 neighbor indices for a position.
 */
export function getAllNeighbors(map: TiMap, position: number): number[] {
  const neighbors: number[] = [];
  for (let dir = 0; dir < 6; dir++) {
    const neighbor = getNeighborAtDirection(map, position, dir);
    if (neighbor !== -1 && neighbor < map.length) {
      neighbors.push(neighbor);
    }
  }
  return neighbors;
}

/**
 * Apply rotation to hyperlane side indices.
 * Rotation is in degrees (0, 60, 120, 180, 240, 300).
 */
function applyRotation(side: number, rotationDegrees: number): number {
  const offset = Math.round(rotationDegrees / 60) % 6;
  return (side + offset) % 6;
}

/**
 * Get the rotated hyperlane connections for a tile.
 * Returns array of [sideA, sideB] pairs after rotation is applied.
 */
function getRotatedHyperlanes(
  hyperlanes: number[][],
  rotationDegrees: number
): number[][] {
  return hyperlanes.map(([a, b]) => [
    applyRotation(a, rotationDegrees),
    applyRotation(b, rotationDegrees),
  ]);
}

/**
 * Check if a tile at the given position is passable.
 * SYSTEM (including hyperlanes), and HOME tiles are passable.
 * OPEN tiles are not passable - they represent empty space.
 */
function isPassableTile(map: TiMap, position: number): boolean {
  const tile = map[position];
  if (!tile) return false;
  return tile.type === "SYSTEM" || tile.type === "HOME";
}

/**
 * Get the cost of moving TO a destination tile.
 * - Moving to a hyperlane = 0 (free to enter/traverse hyperlane network)
 * - Moving to a non-hyperlane = 1 (costs 1 to arrive at a real system)
 */
function getMovementCost(map: TiMap, destPosition: number): number {
  return isHyperlaneTile(map, destPosition) ? 0 : 1;
}

/**
 * Check if a position is on a connected side of a hyperlane.
 * Returns true if the hyperlane at hyperlanePos has a corridor connecting to neighborPos.
 */
function isOnHyperlaneCorridor(
  map: TiMap,
  hyperlanePos: number,
  neighborPos: number
): boolean {
  const hyperlaneData = getHyperlaneData(map, hyperlanePos);
  if (!hyperlaneData) return false;

  const rotatedConnections = getRotatedHyperlanes(
    hyperlaneData.hyperlanes,
    hyperlaneData.rotation
  );

  // Check if neighborPos is at any of the connected sides
  for (const [sideA, sideB] of rotatedConnections) {
    const neighborAtA = getNeighborAtDirection(map, hyperlanePos, sideA);
    const neighborAtB = getNeighborAtDirection(map, hyperlanePos, sideB);
    if (neighborPos === neighborAtA || neighborPos === neighborAtB) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a tile at the given position is a hyperlane.
 */
function isHyperlaneTile(map: TiMap, position: number): boolean {
  const tile = map[position];
  if (!tile || tile.type !== "SYSTEM") return false;

  const system = systemData[tile.systemId];
  return system?.type === "HYPERLANE";
}

/**
 * Get hyperlane data for a tile (if it's a hyperlane).
 * Returns null if not a hyperlane.
 */
function getHyperlaneData(
  map: TiMap,
  position: number
): { hyperlanes: number[][]; rotation: number } | null {
  const tile = map[position];
  if (!tile || tile.type !== "SYSTEM") return null;

  const system = systemData[tile.systemId];
  if (!system?.hyperlanes) return null;

  const rotation = (tile as SystemTile).rotation ?? 0;
  return { hyperlanes: system.hyperlanes, rotation };
}

/**
 * Build a hex graph from the map, accounting for hyperlanes.
 *
 * Cost model (destination-based):
 * - Moving TO a hyperlane = 0 (free to enter/traverse)
 * - Moving TO a non-hyperlane = 1 (costs 1 to arrive)
 *
 * Connectivity rules:
 * - Non-hyperlane tiles connect to adjacent non-hyperlane tiles
 * - Non-hyperlane tiles connect to adjacent hyperlanes ONLY via the hyperlane's corridors
 * - Hyperlane tiles connect to neighbors on their corridor sides only
 */
export function buildHexGraph(map: TiMap): HexGraph {
  const edges = new Map<number, Map<number, number>>();

  // Initialize empty edge maps for all positions
  for (let i = 0; i < map.length; i++) {
    edges.set(i, new Map());
  }

  // Process all passable tiles
  for (let position = 0; position < map.length; position++) {
    if (!isPassableTile(map, position)) continue;

    if (isHyperlaneTile(map, position)) {
      // Hyperlane tile: only connect to neighbors on corridor sides
      const hyperlaneData = getHyperlaneData(map, position);
      if (!hyperlaneData) continue;

      const rotatedConnections = getRotatedHyperlanes(
        hyperlaneData.hyperlanes,
        hyperlaneData.rotation
      );

      // Collect all sides that are part of corridors
      const connectedSides = new Set<number>();
      for (const [sideA, sideB] of rotatedConnections) {
        connectedSides.add(sideA);
        connectedSides.add(sideB);
      }

      // Add edges to neighbors on connected sides
      for (const side of connectedSides) {
        const neighbor = getNeighborAtDirection(map, position, side);
        if (neighbor === -1 || neighbor >= map.length) continue;
        if (!isPassableTile(map, neighbor)) continue;

        // Cost based on destination type
        const cost = getMovementCost(map, neighbor);
        edges.get(position)!.set(neighbor, cost);
      }
    } else {
      // Non-hyperlane tile: connect to adjacent passable tiles
      const neighbors = getAllNeighbors(map, position);
      for (const neighbor of neighbors) {
        if (!isPassableTile(map, neighbor)) continue;

        // If neighbor is a hyperlane, only connect if we're on a corridor side
        if (isHyperlaneTile(map, neighbor)) {
          if (!isOnHyperlaneCorridor(map, neighbor, position)) continue;
        }

        // Cost based on destination type
        const cost = getMovementCost(map, neighbor);
        edges.get(position)!.set(neighbor, cost);
      }
    }
  }

  return { edges };
}

/**
 * Calculate shortest distance between two positions using 0-1 BFS.
 * Handles both 0-cost edges (entering hyperlanes) and 1-cost edges (entering systems).
 *
 * Returns Infinity if the destination is unreachable.
 */
export function getGraphDistance(
  graph: HexGraph,
  from: number,
  to: number
): number {
  if (from === to) return 0;

  const dist = new Map<number, number>();
  const deque: number[] = [from];
  dist.set(from, 0);

  while (deque.length > 0) {
    const current = deque.shift()!;
    const currentDist = dist.get(current)!;

    if (current === to) return currentDist;

    const neighbors = graph.edges.get(current);
    if (!neighbors) continue;

    for (const [neighbor, cost] of neighbors) {
      const newDist = currentDist + cost;
      const existingDist = dist.get(neighbor);

      if (existingDist === undefined || newDist < existingDist) {
        dist.set(neighbor, newDist);
        // 0-1 BFS: push 0-cost edges to front, 1-cost edges to back
        if (cost === 0) {
          deque.unshift(neighbor);
        } else {
          deque.push(neighbor);
        }
      }
    }
  }

  return Infinity;
}

/**
 * Get the shortest path between two positions using 0-1 BFS.
 * Returns array of tile indices from start to end (inclusive).
 * Returns empty array if unreachable.
 */
export function getGraphPath(
  graph: HexGraph,
  from: number,
  to: number
): number[] {
  if (from === to) return [from];

  const dist = new Map<number, number>();
  const parent = new Map<number, number>();
  const deque: number[] = [from];
  dist.set(from, 0);

  while (deque.length > 0) {
    const current = deque.shift()!;
    const currentDist = dist.get(current)!;

    if (current === to) {
      // Reconstruct path from parent pointers
      const path: number[] = [];
      let node: number | undefined = to;
      while (node !== undefined) {
        path.unshift(node);
        node = parent.get(node);
      }
      return path;
    }

    const neighbors = graph.edges.get(current);
    if (!neighbors) continue;

    for (const [neighbor, cost] of neighbors) {
      const newDist = currentDist + cost;
      const existingDist = dist.get(neighbor);

      if (existingDist === undefined || newDist < existingDist) {
        dist.set(neighbor, newDist);
        parent.set(neighbor, current);
        // 0-1 BFS: push 0-cost edges to front, 1-cost edges to back
        if (cost === 0) {
          deque.unshift(neighbor);
        } else {
          deque.push(neighbor);
        }
      }
    }
  }

  return []; // Unreachable
}

/**
 * Get all positions reachable from a starting position within a maximum distance.
 * Returns a Map of position -> distance.
 */
export function getPositionsWithinDistance(
  graph: HexGraph,
  from: number,
  maxDistance: number
): Map<number, number> {
  const dist = new Map<number, number>();
  const deque: number[] = [from];
  dist.set(from, 0);

  while (deque.length > 0) {
    const current = deque.shift()!;
    const currentDist = dist.get(current)!;

    // Don't explore beyond maxDistance
    if (currentDist >= maxDistance) continue;

    const neighbors = graph.edges.get(current);
    if (!neighbors) continue;

    for (const [neighbor, cost] of neighbors) {
      const newDist = currentDist + cost;

      // Skip if beyond max distance
      if (newDist > maxDistance) continue;

      const existingDist = dist.get(neighbor);
      if (existingDist === undefined || newDist < existingDist) {
        dist.set(neighbor, newDist);
        // 0-1 BFS: push 0-cost edges to front, 1-cost edges to back
        if (cost === 0) {
          deque.unshift(neighbor);
        } else {
          deque.push(neighbor);
        }
      }
    }
  }

  return dist;
}

/**
 * Simple hex distance (cube coordinate Chebyshev distance).
 * Does NOT account for hyperlanes - use getGraphDistance for that.
 * Uses tile positions from the map.
 */
export function getSimpleHexDistance(map: TiMap, idx1: number, idx2: number): number {
  const pos1 = map[idx1]?.position;
  const pos2 = map[idx2]?.position;

  if (!pos1 || !pos2) return 99;

  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  const dz = Math.abs(
    (-pos1.x - pos1.y) - (-pos2.x - pos2.y)
  );

  return Math.max(dx, dy, dz);
}

/**
 * Check if two positions are adjacent (including through hyperlanes).
 * Returns true if they have a direct edge in the graph.
 */
export function areAdjacent(
  graph: HexGraph,
  position1: number,
  position2: number
): boolean {
  const cost = graph.edges.get(position1)?.get(position2);
  return cost !== undefined && cost <= 1;
}

/**
 * Get all positions adjacent to the given position (including hyperlane shortcuts).
 */
export function getAdjacentPositions(
  graph: HexGraph,
  position: number
): number[] {
  const neighbors = graph.edges.get(position);
  if (!neighbors) return [];

  return Array.from(neighbors.entries())
    .filter(([_, cost]) => cost <= 1)
    .map(([pos, _]) => pos);
}

/**
 * Build a hex graph from the map, excluding specified tile indices from pathfinding.
 * Used for calculating paths that avoid certain tiles (e.g., other home systems, anomalies).
 *
 * Note: The start/end positions can still be in excludedIndices - only intermediate
 * tiles are blocked. This allows calculating path FROM a home TO Mecatol while
 * excluding OTHER homes.
 *
 * @param map - The tile map
 * @param excludedIndices - Set of tile indices to exclude from pathfinding
 */
export function buildHexGraphWithExclusions(
  map: TiMap,
  excludedIndices: Set<number>,
): HexGraph {
  const edges = new Map<number, Map<number, number>>();

  // Initialize empty edge maps for all positions
  for (let i = 0; i < map.length; i++) {
    edges.set(i, new Map());
  }

  // Process all passable tiles that are NOT excluded
  for (let position = 0; position < map.length; position++) {
    // Skip excluded positions (they won't have outgoing edges)
    if (excludedIndices.has(position)) continue;
    if (!isPassableTile(map, position)) continue;

    if (isHyperlaneTile(map, position)) {
      // Hyperlane tile: only connect to neighbors on corridor sides
      const hyperlaneData = getHyperlaneData(map, position);
      if (!hyperlaneData) continue;

      const rotatedConnections = getRotatedHyperlanes(
        hyperlaneData.hyperlanes,
        hyperlaneData.rotation
      );

      // Collect all sides that are part of corridors
      const connectedSides = new Set<number>();
      for (const [sideA, sideB] of rotatedConnections) {
        connectedSides.add(sideA);
        connectedSides.add(sideB);
      }

      // Add edges to neighbors on connected sides (excluding excluded neighbors)
      for (const side of connectedSides) {
        const neighbor = getNeighborAtDirection(map, position, side);
        if (neighbor === -1 || neighbor >= map.length) continue;
        if (excludedIndices.has(neighbor)) continue; // Skip excluded neighbors
        if (!isPassableTile(map, neighbor)) continue;

        // Cost based on destination type
        const cost = getMovementCost(map, neighbor);
        edges.get(position)!.set(neighbor, cost);
      }
    } else {
      // Non-hyperlane tile: connect to adjacent passable tiles
      const neighbors = getAllNeighbors(map, position);
      for (const neighbor of neighbors) {
        if (excludedIndices.has(neighbor)) continue; // Skip excluded neighbors
        if (!isPassableTile(map, neighbor)) continue;

        // If neighbor is a hyperlane, only connect if we're on a corridor side
        if (isHyperlaneTile(map, neighbor)) {
          if (!isOnHyperlaneCorridor(map, neighbor, position)) continue;
        }

        // Cost based on destination type
        const cost = getMovementCost(map, neighbor);
        edges.get(position)!.set(neighbor, cost);
      }
    }
  }

  return { edges };
}
