/**
 * Mathematical hex coordinate generation for flat-top hexes using cube coordinates.
 * Cube coordinates satisfy: x + y + z = 0
 *
 * Ring structure:
 * - Ring 0: 1 tile (center)
 * - Ring N (N > 0): 6 × N tiles
 * - Total tiles through ring N: 1 + 3 × N × (N + 1)
 */

export type HexCoord = {
  x: number;
  y: number;
  z: number;
};

/**
 * Direction vectors for walking around a hex ring (counterclockwise from top).
 */
const RING_DIRECTIONS: HexCoord[] = [
  { x: 1, y: 0, z: -1 },   // SE
  { x: 0, y: 1, z: -1 },   // S
  { x: -1, y: 1, z: 0 },   // SW
  { x: -1, y: 0, z: 1 },   // NW
  { x: 0, y: -1, z: 1 },   // N
  { x: 1, y: -1, z: 0 },   // NE
];

/**
 * Generate all hex coordinates for a single ring.
 * Ring 0 returns just the center tile.
 * Ring N (N > 0) returns 6*N tiles walking counterclockwise from the top.
 */
export function generateRing(n: number): HexCoord[] {
  if (n === 0) return [{ x: 0, y: 0, z: 0 }];

  const ring: HexCoord[] = [];
  let pos: HexCoord = { x: 0, y: -n, z: n }; // Start at top of ring

  for (let dir = 0; dir < 6; dir++) {
    for (let step = 0; step < n; step++) {
      ring.push({ ...pos });
      pos = {
        x: pos.x + RING_DIRECTIONS[dir].x,
        y: pos.y + RING_DIRECTIONS[dir].y,
        z: pos.z + RING_DIRECTIONS[dir].z,
      };
    }
  }

  return ring;
}

/**
 * Generate all hex coordinates from center (ring 0) through ring N.
 * Returns coordinates in order: center, ring 1, ring 2, ..., ring N.
 */
export function generateHexRings(maxRing: number): HexCoord[] {
  const coords: HexCoord[] = [];
  for (let ring = 0; ring <= maxRing; ring++) {
    coords.push(...generateRing(ring));
  }
  return coords;
}

/**
 * Calculate the total number of tiles for a given number of rings.
 * Formula: 1 + 3 × N × (N + 1) where N is the number of rings (not counting center)
 */
export function getTileCount(rings: number): number {
  return 1 + 3 * rings * (rings + 1);
}

/**
 * Get the ring number that contains a given tile index.
 * Ring 0 = index 0 (center)
 * Ring 1 = indices 1-6
 * Ring 2 = indices 7-18
 * etc.
 */
export function getRingForIndex(idx: number): number {
  if (idx === 0) return 0;

  // Find which ring contains this index
  // Ring N starts at index: 1 + 3 * (N-1) * N
  // Ring N ends at index: 3 * N * (N + 1)
  let ring = 1;
  while (getTileCount(ring) <= idx) {
    ring++;
  }
  return ring;
}

/**
 * Get the starting index of a given ring.
 */
export function getRingStartIndex(ring: number): number {
  if (ring === 0) return 0;
  return getTileCount(ring - 1);
}

/**
 * Get the indices that make up a given ring.
 */
export function getRingIndices(ring: number): number[] {
  const start = getRingStartIndex(ring);
  const end = getTileCount(ring);
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/**
 * Calculate hex distance (Chebyshev distance in cube coordinates).
 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.z - b.z)
  );
}

/**
 * Find the closest index on a target ring to a given coordinate.
 * Returns the index in the full coordinate array.
 */
export function findClosestOnRing(
  coord: HexCoord,
  targetRing: number,
  allCoords: HexCoord[]
): number {
  const ringIndices = getRingIndices(targetRing);
  let closestIdx = ringIndices[0];
  let closestDist = hexDistance(coord, allCoords[closestIdx]);

  for (const idx of ringIndices) {
    const dist = hexDistance(coord, allCoords[idx]);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = idx;
    }
  }

  return closestIdx;
}

/**
 * Find an available position on a ring, starting from a preferred index.
 * Returns the first unoccupied index, or -1 if all positions are occupied.
 */
export function findAvailableOnRing(
  preferredIdx: number,
  targetRing: number,
  occupiedIndices: Set<number>
): number {
  const ringIndices = getRingIndices(targetRing);
  const ringSize = ringIndices.length;

  // Find where preferredIdx is in the ring
  const preferredRingPos = ringIndices.indexOf(preferredIdx);
  if (preferredRingPos === -1) {
    // preferredIdx is not on this ring, start from beginning
    for (const idx of ringIndices) {
      if (!occupiedIndices.has(idx)) return idx;
    }
    return -1;
  }

  // Search outward from preferred position
  for (let offset = 0; offset < ringSize; offset++) {
    // Try forward
    const forwardIdx = ringIndices[(preferredRingPos + offset) % ringSize];
    if (!occupiedIndices.has(forwardIdx)) return forwardIdx;

    // Try backward (skip 0 offset to avoid duplicate)
    if (offset > 0) {
      const backwardIdx = ringIndices[(preferredRingPos - offset + ringSize) % ringSize];
      if (!occupiedIndices.has(backwardIdx)) return backwardIdx;
    }
  }

  return -1;
}
