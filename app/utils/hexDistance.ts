import { Map as TiMap, SystemTile, Anomaly, TilePosition } from "~/types";
import { systemData } from "~/data/systemData";
import { hexDistance } from "~/utils/hexCoordinates";

/** Anomalies that we want to avoid when choosing between equal-length paths */
const AVOIDABLE_ANOMALIES: Anomaly[] = ["SUPERNOVA", "NEBULA", "ASTEROID_FIELD", "GRAVITY_RIFT"];

/**
 * Check if a tile contains any avoidable anomaly.
 */
function hasAvoidableAnomaly(map: TiMap, position: number): boolean {
  const tile = map[position];
  if (!tile || tile.type !== "SYSTEM") return false;

  const system = systemData[(tile as SystemTile).systemId];
  if (!system) return false;

  return system.anomalies.some(a => AVOIDABLE_ANOMALIES.includes(a));
}

/**
 * Hex graph for pathfinding with hyperlane support.
 * Edges map: position -> (neighbor position -> cost)
 *
 * Cost model (destination-based):
 * - Moving TO a non-hyperlane tile = 1 cost (arriving at a system/home)
 * - Moving TO a hyperlane tile = 0 cost when a lane pair exits into one
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
 * Anything laid out on the hex grid by index: map tiles, or
 * `{ position }` wrappers around raw coordinates.
 */
type PositionedGrid = ReadonlyArray<{ position?: TilePosition } | undefined>;

/**
 * Get the neighbor index for a given index and direction, by looking up
 * the neighboring cube coordinate in the grid.
 * Returns -1 if no neighbor exists at that position.
 */
function getNeighborAtDirection(
  grid: PositionedGrid,
  position: number,
  direction: number,
): number {
  const pos = grid[position]?.position;
  if (!pos) return -1;

  const offset = DIRECTION_OFFSETS[direction];
  const neighborX = pos.x + offset.x;
  const neighborY = pos.y + offset.y;

  for (let i = 0; i < grid.length; i++) {
    const p = grid[i]?.position;
    if (p && p.x === neighborX && p.y === neighborY) return i;
  }

  return -1;
}

/**
 * Get all physically adjacent indices (up to 6) for a position.
 * Ignores hyperlanes - use buildHexGraph + getGraphNeighbors for that.
 */
export function getAllNeighbors(grid: PositionedGrid, position: number): number[] {
  const neighbors: number[] = [];
  for (let dir = 0; dir < 6; dir++) {
    const neighbor = getNeighborAtDirection(grid, position, dir);
    if (neighbor !== -1) neighbors.push(neighbor);
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
 * OPEN tiles are not passable by default - they represent empty space.
 *
 * @param includeOpen - If true, treat OPEN tiles as passable (useful for adjacency checks during tile placement)
 */
function isPassableTile(map: TiMap, position: number, includeOpen = false): boolean {
  const tile = map[position];
  if (!tile) return false;
  if (includeOpen && tile.type === "OPEN") return true;
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

function addEdge(
  edges: Map<number, Map<number, number>>,
  map: TiMap,
  from: number,
  to: number,
) {
  edges.get(from)!.set(to, getMovementCost(map, to));
}

function getOppositeSide(side: number): number {
  return (side + 3) % 6;
}

function resolveHyperlaneEntry(
  map: TiMap,
  hyperlanePosition: number,
  entrySide: number,
  includeOpenTiles: boolean,
  excludedIndices: Set<number>,
  visited: Set<string>,
): number[] {
  const key = `${hyperlanePosition}:${entrySide}`;
  if (visited.has(key)) return [];

  const hyperlaneData = getHyperlaneData(map, hyperlanePosition);
  if (!hyperlaneData) return [];

  const nextVisited = new Set(visited);
  nextVisited.add(key);

  const rotatedConnections = getRotatedHyperlanes(
    hyperlaneData.hyperlanes,
    hyperlaneData.rotation,
  );

  return rotatedConnections.flatMap(([sideA, sideB]) => {
    if (sideA === entrySide) {
      return resolveHyperlaneExit(
        map,
        hyperlanePosition,
        sideB,
        includeOpenTiles,
        excludedIndices,
        nextVisited,
      );
    }

    if (sideB === entrySide) {
      return resolveHyperlaneExit(
        map,
        hyperlanePosition,
        sideA,
        includeOpenTiles,
        excludedIndices,
        nextVisited,
      );
    }

    return [];
  });
}

function resolveHyperlaneExit(
  map: TiMap,
  hyperlanePosition: number,
  exitSide: number,
  includeOpenTiles: boolean,
  excludedIndices: Set<number>,
  visited: Set<string>,
): number[] {
  const neighbor = getNeighborAtDirection(map, hyperlanePosition, exitSide);

  if (neighbor === -1 || neighbor >= map.length) return [];
  if (excludedIndices.has(neighbor)) return [];
  if (!isPassableTile(map, neighbor, includeOpenTiles)) return [];
  if (!isHyperlaneTile(map, neighbor)) return [neighbor];

  return resolveHyperlaneEntry(
    map,
    neighbor,
    getOppositeSide(exitSide),
    includeOpenTiles,
    excludedIndices,
    visited,
  );
}

function addHyperlanePairEdges(
  edges: Map<number, Map<number, number>>,
  map: TiMap,
  hyperlanePosition: number,
  includeOpenTiles: boolean,
  excludedIndices: Set<number> = new Set(),
) {
  if (excludedIndices.has(hyperlanePosition)) return;

  const hyperlaneData = getHyperlaneData(map, hyperlanePosition);
  if (!hyperlaneData) return;

  const rotatedConnections = getRotatedHyperlanes(
    hyperlaneData.hyperlanes,
    hyperlaneData.rotation,
  );

  for (const [sideA, sideB] of rotatedConnections) {
    const exitsA = resolveHyperlaneExit(
      map,
      hyperlanePosition,
      sideA,
      includeOpenTiles,
      excludedIndices,
      new Set(),
    );
    const exitsB = resolveHyperlaneExit(
      map,
      hyperlanePosition,
      sideB,
      includeOpenTiles,
      excludedIndices,
      new Set(),
    );

    for (const exitA of exitsA) {
      for (const exitB of exitsB) {
        addEdge(edges, map, exitA, exitB);
        addEdge(edges, map, exitB, exitA);
      }
    }
  }
}

/**
 * Options for building the hex graph.
 */
type BuildHexGraphOptions = {
  /**
   * If true, treat OPEN tiles as traversable.
   * Useful for adjacency checks during tile placement where we need to check
   * if OPEN positions are adjacent to anomalies through hyperlanes.
   */
  includeOpenTiles?: boolean;
  /**
   * Tile indices removed from the graph entirely (no edges in or out),
   * e.g. other players' home systems when measuring a player's paths.
   */
  excludedIndices?: Set<number>;
};

/**
 * Build a hex graph from the map, accounting for hyperlanes.
 *
 * Connectivity rules:
 * - Non-hyperlane tiles connect to adjacent non-hyperlane tiles
 * - Hyperlane lane pairs connect their two neighboring exits directly
 *
 * @param options.includeOpenTiles - If true, OPEN tiles are treated as traversable
 * @param options.excludedIndices - Tiles to remove from the graph
 */
export function buildHexGraph(map: TiMap, options: BuildHexGraphOptions = {}): HexGraph {
  const { includeOpenTiles = false, excludedIndices = new Set<number>() } =
    options;
  const edges = new Map<number, Map<number, number>>();

  // Initialize empty edge maps for all positions
  for (let i = 0; i < map.length; i++) {
    edges.set(i, new Map());
  }

  // Process physical adjacency between non-hyperlane tiles.
  for (let position = 0; position < map.length; position++) {
    if (excludedIndices.has(position)) continue;
    if (!isPassableTile(map, position, includeOpenTiles)) continue;

    if (isHyperlaneTile(map, position)) continue;

    const neighbors = getAllNeighbors(map, position);
    for (const neighbor of neighbors) {
      if (excludedIndices.has(neighbor)) continue;
      if (!isPassableTile(map, neighbor, includeOpenTiles)) continue;
      if (isHyperlaneTile(map, neighbor)) continue;

      addEdge(edges, map, position, neighbor);
    }
  }

  for (let position = 0; position < map.length; position++) {
    if (isHyperlaneTile(map, position)) {
      addHyperlanePairEdges(
        edges,
        map,
        position,
        includeOpenTiles,
        excludedIndices,
      );
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
 *
 * When multiple shortest paths exist, prioritizes paths with fewer anomalies
 * if a map is provided for anomaly checking.
 */
export function getGraphPath(
  graph: HexGraph,
  from: number,
  to: number,
  map?: TiMap
): number[] {
  if (from === to) return [from];

  // Track distance and anomaly count for tie-breaking
  const dist = new Map<number, number>();
  const anomalyCount = new Map<number, number>();
  const parent = new Map<number, number>();
  const deque: number[] = [from];
  dist.set(from, 0);
  anomalyCount.set(from, 0);

  while (deque.length > 0) {
    const current = deque.shift()!;
    const currentDist = dist.get(current)!;
    const currentAnomalies = anomalyCount.get(current)!;

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

      // Count anomalies on this path (only if map provided)
      const neighborHasAnomaly = map ? hasAvoidableAnomaly(map, neighbor) : false;
      const newAnomalyCount = currentAnomalies + (neighborHasAnomaly ? 1 : 0);
      const existingAnomalyCount = anomalyCount.get(neighbor) ?? Infinity;

      // Update if: shorter distance, OR same distance but fewer anomalies
      const isBetter = existingDist === undefined ||
        newDist < existingDist ||
        (newDist === existingDist && newAnomalyCount < existingAnomalyCount);

      if (isBetter) {
        dist.set(neighbor, newDist);
        anomalyCount.set(neighbor, newAnomalyCount);
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
 * Simple hex distance between two map indices.
 * Does NOT account for hyperlanes - use getGraphDistance for that.
 */
export function getSimpleHexDistance(map: TiMap, idx1: number, idx2: number): number {
  const pos1 = map[idx1]?.position;
  const pos2 = map[idx2]?.position;

  if (!pos1 || !pos2) return 99;

  return hexDistance(
    { x: pos1.x, y: pos1.y, z: -pos1.x - pos1.y },
    { x: pos2.x, y: pos2.y, z: -pos2.x - pos2.y },
  );
}

/**
 * Get all positions adjacent to the given position in the graph
 * (including hyperlane shortcuts).
 */
export function getGraphNeighbors(graph: HexGraph, position: number): number[] {
  const neighbors = graph.edges.get(position);
  if (!neighbors) return [];

  return Array.from(neighbors.entries())
    .filter(([, cost]) => cost <= 1)
    .map(([pos]) => pos);
}

