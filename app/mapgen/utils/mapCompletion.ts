import { Map, SystemId } from "~/types";
import { systemData } from "~/data/systemData";
import { shuffle } from "~/draft/helpers/randomization";
import { isPlacementLegal, buildAdjacencyMap } from "./mapLegality";

/**
 * Pre-select systems to fill the map based on constraints.
 * This avoids backtracking by determining the pool upfront.
 */
function selectSystemPool(
  availableSystemIds: SystemId[],
  slotsToFill: number,
  minAlpha: number,
  minBeta: number,
  minRed: number
): SystemId[] {
  const selected: SystemId[] = [];
  const remaining = new Set(availableSystemIds);

  // Categorize systems
  const alphaWormholes: SystemId[] = [];
  const betaWormholes: SystemId[] = [];
  const redTiles: SystemId[] = [];
  const blueTiles: SystemId[] = [];

  for (const id of availableSystemIds) {
    const system = systemData[id];
    if (!system) continue;

    // Skip hyperlanes - they're placed by templates
    if (system.type === "HYPERLANE") continue;

    // Track alpha/beta wormholes separately for minimum requirements
    if (system.wormholes.includes("ALPHA")) {
      alphaWormholes.push(id);
    } else if (system.wormholes.includes("BETA")) {
      betaWormholes.push(id);
    }

    // Categorize by tile type (including wormhole tiles)
    if (system.type === "RED") {
      redTiles.push(id);
    } else if (system.type === "BLUE") {
      blueTiles.push(id);
    }
  }

  // Shuffle each category
  const shuffledAlpha = shuffle(alphaWormholes);
  const shuffledBeta = shuffle(betaWormholes);
  const shuffledRed = shuffle(redTiles);
  const shuffledBlue = shuffle(blueTiles);

  // 1. Pick required alpha wormholes
  const alphaCount = Math.min(minAlpha, shuffledAlpha.length);
  for (let i = 0; i < alphaCount && selected.length < slotsToFill; i++) {
    selected.push(shuffledAlpha[i]);
    remaining.delete(shuffledAlpha[i]);
  }

  // 2. Pick required beta wormholes
  const betaCount = Math.min(minBeta, shuffledBeta.length);
  for (let i = 0; i < betaCount && selected.length < slotsToFill; i++) {
    selected.push(shuffledBeta[i]);
    remaining.delete(shuffledBeta[i]);
  }

  // 3. Count red tiles already selected (wormholes can be red)
  let currentRedCount = selected.filter((id) => {
    const sys = systemData[id];
    return sys?.type === "RED";
  }).length;

  // 4. Pick red tiles to meet minimum (with some extra chance for variety)
  const redNeeded = Math.max(0, minRed - currentRedCount);
  let extraReds = 0;
  while (Math.random() < 0.5 * Math.pow(0.7, extraReds) && extraReds < 5) {
    extraReds++;
  }
  const redToSelect = redNeeded + extraReds;

  let redsAdded = 0;
  for (const id of shuffledRed) {
    if (redsAdded >= redToSelect || selected.length >= slotsToFill) break;
    if (remaining.has(id)) {
      selected.push(id);
      remaining.delete(id);
      redsAdded++;
    }
  }

  // 5. Fill remaining slots with blue tiles
  for (const id of shuffledBlue) {
    if (selected.length >= slotsToFill) break;
    if (remaining.has(id)) {
      selected.push(id);
      remaining.delete(id);
    }
  }

  // 6. If still need more, add any remaining tiles
  for (const id of remaining) {
    if (selected.length >= slotsToFill) break;
    const system = systemData[id];
    if (system && system.type !== "HYPERLANE") {
      selected.push(id);
    }
  }

  return shuffle(selected);
}

/**
 * Find a legal placement for a system among open tile indices.
 * Returns the tile index or -1 if no legal placement exists.
 */
function findLegalPlacement(
  map: Map,
  openIndices: number[],
  systemId: SystemId,
  adjacencyMap: globalThis.Map<number, number[]>
): number {
  // Shuffle to randomize placement
  const shuffledIndices = shuffle([...openIndices]);

  for (const idx of shuffledIndices) {
    if (isPlacementLegal(map, idx, systemId, adjacencyMap)) {
      return idx;
    }
  }

  return -1;
}

/**
 * Main function to auto-complete a partially filled map.
 * Uses pre-selection algorithm - no backtracking needed.
 * @param closedTiles - Optional array of tile indices that are closed (from store, not tile.type)
 */
export function autoCompleteMap(
  currentMap: Map,
  availableSystemIds: SystemId[],
  closedTiles: number[] = []
): Map | null {
  const closedSet = new Set(closedTiles);
  const openIndices: number[] = [];
  currentMap.forEach((tile, idx) => {
    // Skip tiles in closedTiles array
    if (closedSet.has(idx)) return;
    // Include OPEN tiles and CLOSED tiles that were reopened (not in closedTiles)
    if (tile.type === "OPEN" || tile.type === "CLOSED") {
      openIndices.push(idx);
    }
  });

  if (openIndices.length === 0) return currentMap;

  // Scale red tile requirement based on map size (baseline: 11 red for 30 tiles)
  const redTileRatio = 11 / 30;
  const minRedTiles = Math.round(openIndices.length * redTileRatio);

  const adjacencyMap = buildAdjacencyMap(currentMap);

  const selectedSystems = selectSystemPool(
    availableSystemIds,
    openIndices.length,
    2,
    2,
    minRedTiles
  );

  const result: Map = currentMap.map((tile) => ({ ...tile }));
  const remainingOpenIndices = [...openIndices];
  const placedSystems = new Set<SystemId>();

  // First pass: place pre-selected systems
  for (const systemId of selectedSystems) {
    if (remainingOpenIndices.length === 0) break;

    const legalIdx = findLegalPlacement(result, remainingOpenIndices, systemId, adjacencyMap);

    if (legalIdx !== -1) {
      result[legalIdx] = {
        ...result[legalIdx],
        type: "SYSTEM",
        systemId,
      };
      remainingOpenIndices.splice(remainingOpenIndices.indexOf(legalIdx), 1);
      placedSystems.add(systemId);
    }
  }

  // Second pass: fill any remaining slots with random available systems
  if (remainingOpenIndices.length > 0) {
    const unusedSystems = availableSystemIds.filter((id) => {
      if (placedSystems.has(id)) return false;
      const system = systemData[id];
      return system && system.type !== "HYPERLANE";
    });

    for (const systemId of shuffle(unusedSystems)) {
      if (remainingOpenIndices.length === 0) break;

      const legalIdx = findLegalPlacement(result, remainingOpenIndices, systemId, adjacencyMap);

      if (legalIdx !== -1) {
        result[legalIdx] = {
          ...result[legalIdx],
          type: "SYSTEM",
          systemId,
        };
        remainingOpenIndices.splice(remainingOpenIndices.indexOf(legalIdx), 1);
        placedSystems.add(systemId);
      }
    }
  }

  // Third pass: if still have open slots, fill with any remaining systems ignoring legality
  // This ensures the map is always completely filled
  if (remainingOpenIndices.length > 0) {
    const stillUnused = availableSystemIds.filter((id) => {
      if (placedSystems.has(id)) return false;
      const system = systemData[id];
      return system && system.type !== "HYPERLANE";
    });

    for (const systemId of shuffle(stillUnused)) {
      if (remainingOpenIndices.length === 0) break;

      const idx = remainingOpenIndices.shift()!;
      result[idx] = {
        ...result[idx],
        type: "SYSTEM",
        systemId,
      };
      placedSystems.add(systemId);
    }
  }

  return result;
}
