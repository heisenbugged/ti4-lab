import { Map, SystemId, Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { mapStringOrder } from "~/data/mapStringOrder";

const MAX_ATTEMPTS = 10000;

type CompletionOptions = {
  minAlphaWormholes?: number;
  minBetaWormholes?: number;
  targetBlueRatio?: number | null; // null means random
  minRedTiles?: number;
};

type MapState = {
  map: Map;
  availableSystemIds: SystemId[];
};

/**
 * Checks if a tile placement would violate map legality rules:
 * - Same wormholes cannot be adjacent
 * - Anomalies cannot be adjacent to other anomalies
 */
function isPlacementLegal(
  map: Map,
  tileIdx: number,
  systemId: SystemId
): boolean {
  const system = systemData[systemId];
  if (!system) return false;

  // Get adjacent tile indices
  const adjacentIndices = getAdjacentTileIndices(tileIdx, map.length);

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

  return true;
}

/**
 * Returns adjacent tile indices for a given tile index on the map.
 * Uses the hex grid coordinate system.
 */
function getAdjacentTileIndices(tileIdx: number, mapSize: number): number[] {
  if (tileIdx >= mapStringOrder.length) return [];

  const pos = mapStringOrder[tileIdx];
  const { x, y } = pos;

  // Hex grid adjacent positions
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
 * Filters available systems based on options like wormhole requirements.
 */
function filterAvailableSystems(
  availableSystemIds: SystemId[],
  openSpaces: number,
  currentBlueCount: number,
  currentRedCount: number,
  currentAlphaCount: number,
  currentBetaCount: number,
  options: CompletionOptions
): SystemId[] {
  let filtered = [...availableSystemIds];

  // Get wormhole counts in available systems
  const availableSystems = filtered.map((id) => systemData[id]);
  const availableAlphaCount = availableSystems.filter((sys) =>
    sys.wormholes.includes("ALPHA")
  ).length;
  const availableBetaCount = availableSystems.filter((sys) =>
    sys.wormholes.includes("BETA")
  ).length;

  // Minimum alpha wormholes requirement
  if (options.minAlphaWormholes !== undefined) {
    const maxPossibleAlpha = currentAlphaCount + availableAlphaCount;
    if (currentAlphaCount < options.minAlphaWormholes && maxPossibleAlpha >= options.minAlphaWormholes) {
      // Need more alpha wormholes to meet minimum
      if (currentAlphaCount + openSpaces >= options.minAlphaWormholes) {
        const alphaFiltered = filtered.filter(
          (id) => systemData[id].wormholes.includes("ALPHA")
        );
        if (alphaFiltered.length > 0) filtered = alphaFiltered;
      }
    }
  }

  // Minimum beta wormholes requirement
  if (options.minBetaWormholes !== undefined) {
    const maxPossibleBeta = currentBetaCount + availableBetaCount;
    if (currentBetaCount < options.minBetaWormholes && maxPossibleBeta >= options.minBetaWormholes) {
      // Need more beta wormholes to meet minimum
      if (currentBetaCount + openSpaces >= options.minBetaWormholes) {
        const betaFiltered = filtered.filter(
          (id) => systemData[id].wormholes.includes("BETA")
        );
        if (betaFiltered.length > 0) filtered = betaFiltered;
      }
    }
  }

  // Minimum red tiles requirement
  if (options.minRedTiles !== undefined) {
    const totalSystems = currentBlueCount + currentRedCount + openSpaces;
    const maxPossibleRed = currentRedCount + openSpaces;

    if (currentRedCount < options.minRedTiles && maxPossibleRed >= options.minRedTiles) {
      // Need more red tiles to meet minimum
      const redFiltered = filtered.filter(
        (id) => systemData[id].type === "RED"
      );
      if (redFiltered.length > 0) filtered = redFiltered;
    }
  }

  // Blue/red ratio targeting
  if (options.targetBlueRatio !== null && options.targetBlueRatio !== undefined) {
    const totalSystems = currentBlueCount + currentRedCount + openSpaces;
    const targetBlue = options.targetBlueRatio;
    const targetRed = totalSystems - targetBlue;
    const currentRatio = currentRedCount > 0 ? currentBlueCount / currentRedCount : Infinity;
    const targetRatio = targetRed > 0 ? targetBlue / targetRed : Infinity;

    if (targetRatio < currentRatio) {
      // Need more red tiles
      const redFiltered = filtered.filter(
        (id) => systemData[id].type === "RED"
      );
      if (redFiltered.length > 0) filtered = redFiltered;
    } else if (targetRatio > currentRatio) {
      // Need more blue tiles
      const blueFiltered = filtered.filter(
        (id) => systemData[id].type === "BLUE"
      );
      if (blueFiltered.length > 0) filtered = blueFiltered;
    }
  }

  return filtered;
}

/**
 * Attempts to add one system to the map, returning a new state or false if impossible.
 * Skips HOME and CLOSED tiles.
 */
function addOneSystem(
  state: MapState,
  options: CompletionOptions
): MapState | false {
  const openTileIndices = state.map
    .map((tile, idx) => (tile.type === "OPEN" ? idx : -1))
    .filter((idx) => idx !== -1);

  if (openTileIndices.length === 0) return false;

  // Count current blue/red and wormholes
  let currentBlue = 0;
  let currentRed = 0;
  let currentAlphaCount = 0;
  let currentBetaCount = 0;

  for (const tile of state.map) {
    if (tile.type === "SYSTEM") {
      const system = systemData[tile.systemId];
      if (system) {
        if (system.type === "BLUE") currentBlue++;
        if (system.type === "RED") currentRed++;
        if (system.wormholes.includes("ALPHA")) currentAlphaCount++;
        if (system.wormholes.includes("BETA")) currentBetaCount++;
      }
    }
  }

  // Filter available systems based on options
  const filteredSystems = filterAvailableSystems(
    state.availableSystemIds,
    openTileIndices.length,
    currentBlue,
    currentRed,
    currentAlphaCount,
    currentBetaCount,
    options
  );

  if (filteredSystems.length === 0) return false;

  // Build list of legal (system, tile) pairs BEFORE picking randomly
  const legalPlacements: Array<{ systemId: SystemId; tileIdx: number }> = [];

  for (const systemId of filteredSystems) {
    for (const tileIdx of openTileIndices) {
      if (isPlacementLegal(state.map, tileIdx, systemId)) {
        legalPlacements.push({ systemId, tileIdx });
      }
    }
  }

  if (legalPlacements.length === 0) return false;

  // Pick randomly from legal placements only
  const chosen = legalPlacements[Math.floor(Math.random() * legalPlacements.length)];
  const chosenSystemId = chosen.systemId;
  const chosenTileIdx = chosen.tileIdx;

  // Create new state
  const newMap = state.map.map((tile, idx) => {
    if (idx === chosenTileIdx) {
      return {
        ...tile,
        type: "SYSTEM" as const,
        systemId: chosenSystemId,
      };
    }
    return tile;
  });

  const newAvailableSystemIds = state.availableSystemIds.filter(
    (id) => id !== chosenSystemId
  );

  return {
    map: newMap,
    availableSystemIds: newAvailableSystemIds,
  };
}

/**
 * Recursively attempts to complete the map with backtracking.
 */
function autoCompleteSteps(
  history: MapState[],
  stepsForward: number,
  currentAttempts: number,
  backtrackLimit: number
): MapState[] | false {
  const startingLength = history.length;

  for (let attempts = currentAttempts; attempts < MAX_ATTEMPTS; attempts++) {
    const newState = addOneSystem(
      history[history.length - 1],
      {
        minAlphaWormholes: 2,
        minBetaWormholes: 2,
        targetBlueRatio: null,
        minRedTiles: 11,
      }
    );

    if (newState !== false) {
      history.push(newState);

      if (history.length >= startingLength + stepsForward) {
        return history;
      } else {
        return autoCompleteSteps(
          history,
          stepsForward - 1,
          attempts,
          backtrackLimit
        );
      }
    }
  }

  // Backtrack: pop at least one state to try a different path
  if (history.length <= 1) {
    return false; // Can't backtrack further
  }

  history.pop(); // Remove the failing state

  return autoCompleteSteps(history, 1, 0, history.length);
}

/**
 * Main function to auto-complete a partially filled map.
 * Returns a completed map or null if unable to complete.
 */
export function autoCompleteMap(
  currentMap: Map,
  availableSystemIds: SystemId[]
): Map | null {
  const openCount = currentMap.filter((tile) => tile.type === "OPEN").length;

  if (openCount === 0) return currentMap; // Already complete

  const initialState: MapState = {
    map: currentMap.map((tile) => ({ ...tile })),
    availableSystemIds: [...availableSystemIds],
  };

  let history: MapState[] = [initialState];

  // Keep adding systems until map is complete
  while (history[history.length - 1].map.some((tile) => tile.type === "OPEN")) {
    const result = autoCompleteSteps(history, 1, 0, history.length);

    if (result === false) {
      return null; // Unable to complete
    }

    history = result;
  }

  return history[history.length - 1].map;
}
