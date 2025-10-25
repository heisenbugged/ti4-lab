import { Map, SystemId, Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { mapStringOrder } from "~/data/mapStringOrder";

// Standard Milty 6p home system positions
const MILTY_6P_HOME_POSITIONS = [19, 22, 25, 28, 31, 34];

/**
 * Simple slice scoring algorithm based on ti4-map-lab.
 * Calculates value of systems adjacent to each home system,
 * weighted by distance.
 */

type SliceStats = {
  resources: number;
  influence: number;
  techs: string;
  traits: string;
};

/**
 * Get adjacent tile indices in hexagonal grid
 */
function getAdjacentIndices(idx: number, mapLength: number): number[] {
  if (idx >= mapStringOrder.length) return [];

  const pos = mapStringOrder[idx];
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
  for (let i = 0; i < Math.min(mapLength, mapStringOrder.length); i++) {
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
 * Get hex distance between two tiles
 */
function getHexDistance(idx1: number, idx2: number): number {
  const pos1 = mapStringOrder[idx1];
  const pos2 = mapStringOrder[idx2];

  if (!pos1 || !pos2) return 99;

  // Cube coordinate distance
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  const dz = Math.abs((pos1.z ?? -pos1.x - pos1.y) - (pos2.z ?? -pos2.x - pos2.y));

  return Math.max(dx, dy, dz);
}

/**
 * Calculate simple value for a system (used for slice scoring)
 */
function getSystemValue(systemId: SystemId): number {
  const system = systemData[systemId];
  if (!system) return 0;

  let value = 0;

  // Use max of planet resources or influence (optimal resource type)
  system.planets.forEach((planet) => {
    value += Math.max(planet.resources, planet.influence);

    // Add bonus for tech specialties
    if (planet.tech && planet.tech.length > 0) {
      value += 1;
    }

    // Add bonus for legendary planets
    if (planet.legendary) {
      value += 1;
    }
  });

  // Add bonus for entropic scar (system-level anomaly)
  if (system.anomalies.includes("ENTROPIC_SCAR")) {
    value += 2;
  }

  return value;
}

/**
 * Calculate the value of a slice (home system and adjacent systems)
 * Returns a score based on nearby system values weighted by distance
 */
export function calculateSliceValue(map: Map, homeIdx: number): number {
  let totalValue = 0;

  // Find all systems within 3 spaces
  for (let i = 0; i < map.length; i++) {
    const tile = map[i];
    if (tile.type !== "SYSTEM") continue;

    const distance = getHexDistance(homeIdx, i);

    // Only count systems within 3 spaces
    if (distance === 0 || distance > 3) continue;

    const systemValue = getSystemValue(tile.systemId);

    // Weight by distance: distance 1 = full value, distance 2 = 0.5x, distance 3 = 0.25x
    const distanceMultiplier = distance === 1 ? 1.0 : distance === 2 ? 0.5 : 0.25;

    totalValue += systemValue * distanceMultiplier;
  }

  return Math.round(totalValue * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate detailed stats for a slice
 */
export function calculateSliceStats(map: Map, homeIdx: number): SliceStats {
  let resources = 0;
  let influence = 0;
  const techs: string[] = [];
  let hazardous = 0;
  let industrial = 0;
  let cultural = 0;

  // Get adjacent tiles (distance 1)
  const adjacentIndices = getAdjacentIndices(homeIdx, map.length);

  adjacentIndices.forEach((idx) => {
    const tile = map[idx];
    if (tile.type !== "SYSTEM") return;

    const system = systemData[tile.systemId];
    if (!system) return;

    system.planets.forEach((planet) => {
      resources += planet.resources;
      influence += planet.influence;

      // Track tech specialties
      if (planet.tech) {
        planet.tech.forEach((tech) => {
          const techAbbr =
            tech === "BIOTIC" ? "G" :
            tech === "WARFARE" ? "R" :
            tech === "PROPULSION" ? "B" :
            tech === "CYBERNETIC" ? "Y" : "";
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
  });

  return {
    resources,
    influence,
    techs: techs.sort().join(""),
    traits: `${hazardous}/${industrial}/${cultural}`,
  };
}

/**
 * Get all home system values from the map
 */
export function getAllSliceValues(map: Map): Record<number, number> {
  const values: Record<number, number> = {};

  MILTY_6P_HOME_POSITIONS.forEach((homeIdx) => {
    values[homeIdx] = calculateSliceValue(map, homeIdx);
  });

  return values;
}

/**
 * Get all slice stats from the map
 */
export function getAllSliceStats(map: Map): Record<number, SliceStats> {
  const stats: Record<number, SliceStats> = {};

  MILTY_6P_HOME_POSITIONS.forEach((homeIdx) => {
    stats[homeIdx] = calculateSliceStats(map, homeIdx);
  });

  return stats;
}

/**
 * Calculate the balance gap (difference between highest and lowest slice values)
 */
export function calculateBalanceGap(sliceValues: Record<number, number>): number {
  const values = Object.values(sliceValues);
  if (values.length === 0) return 0;

  const max = Math.max(...values);
  const min = Math.min(...values);

  return Math.round((max - min) * 10) / 10;
}
