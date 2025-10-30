import { DraftSettings, FactionId, Map, SystemId, SystemIds } from "~/types";
import {
  groupSystemsByTier,
  separateAnomalies,
  shuffleTieredSystems,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import {
  ChoosableTier,
  DraftConfig,
  SliceGenerationConfig,
  TieredSlice,
  TieredSystems,
} from "../types";
import { shuffle } from "../helpers/randomization";
import { mapStringOrder } from "~/data/mapStringOrder";
import { generateEmptyMap } from "~/utils/map";
import { draftConfig } from "../draftConfig";
import { systemIdsInSlice, systemIdsToSlices } from "~/utils/slice";
import { calculateMapStats } from "~/hooks/useFullMapStats";
import { getSystemPool } from "~/utils/system";
import { miltySystemTiers } from "~/data/miltyTileTiers";

// Define which tiles are adjacent to home systems
export const HOME_ADJACENT_TILES = [1, 2, 3];

export type CoreGenerateSlicesArgs = {
  // Configuration parameters
  sliceCount: number;
  sliceShape: string[];
  systemTiers: Record<string, ChoosableTier>;
  availableSystems: SystemId[];
  config: SliceGenerationConfig;
  mecatolPath: number[] | undefined;
  centerTile: number;

  // Strategy functions
  getSliceTiers: () => TieredSlice;
  validateSystems: (
    systems: TieredSystems,
    config: SliceGenerationConfig,
  ) => boolean;
  validateSlice: (slice: SystemIds, config: SliceGenerationConfig) => boolean;

  // Post-processing options
  postProcessSlices?: (
    slices: SystemIds[],
    config: SliceGenerationConfig,
    mecatolPath?: number[],
    centerTile?: number,
  ) => void;
};

export function coreRerollSlice(
  settings: DraftSettings,
  map: Map,
  slices: SystemIds[],
  sliceToRerollIdx: number,
  minorFactionPool?: FactionId[],
): { slice: SystemIds; valid: boolean } | undefined {
  const config = draftConfig[settings.type];

  // Collect systems that are currently in use (in the map and other slices)
  const systemsInMap = map
    .filter((tile) => tile.type === "SYSTEM")
    .map((tile) => (tile as { systemId: SystemId }).systemId);

  const systemsInOtherSlices = slices
    .filter((_, idx) => idx !== sliceToRerollIdx)
    .flat();

  // Get all system IDs from the original systems pool that aren't in use
  const allSystems = getSystemPool(settings.tileGameSets);
  const availableSystems = allSystems.filter(
    (id) => !systemsInMap.includes(id) && !systemsInOtherSlices.includes(id),
  );

  const maxAttempts = 1000;
  function attemptReroll(
    currentAttempt: number,
  ): { slice: SystemIds; valid: boolean } | undefined {
    if (currentAttempt > maxAttempts) return undefined;

    const newSlices = config.generateSlices(1, availableSystems, {
      ...settings.sliceGenerationConfig,
      numAlphas: 0,
      numBetas: 0,
      minLegendaries: 0,
      minorFactionPool,
    });
    if (!newSlices || newSlices.length === 0) return undefined;

    const newSlice = newSlices[0];
    const updatedSlices = [...slices];
    updatedSlices[sliceToRerollIdx] = newSlice;

    const isMapValid = validateMap(config, settings, map, updatedSlices);
    if (!isMapValid) return attemptReroll(currentAttempt + 1);
    return {
      slice: newSlice,
      valid: isMapValid,
    };
  }

  return attemptReroll(0);
}

export const coreRerollMap = (settings: DraftSettings, slices: SystemIds[]) =>
  coreGenerateMap(
    settings,
    getSystemPool(settings.tileGameSets),
    0,
    // do not generate slices, just re-use the existing slices
    () => slices,
  );

/**
 * Generate a map and slices using a core function.
 */
export function coreGenerateMap(
  settings: DraftSettings,
  systemPool: SystemId[],
  attempts: number = 0,
  generateSlices: (
    sliceCount: number,
    availableSystems: SystemId[],
    config?: SliceGenerationConfig,
    sliceShape?: string[],
    minorFactionPool?: FactionId[],
  ) => SystemIds[] | undefined,
  minorFactionPool?: FactionId[],
) {
  const config = draftConfig[settings.type];
  const map = generateEmptyMap(config);
  const numMapTiles = config.modifiableMapTiles.length;
  const slices = generateSlices(settings.numSlices, systemPool, {
    ...settings.sliceGenerationConfig,
    minorFactionPool,
  });

  if (!slices) return undefined;
  const usedSystemIds = slices.flat(1);
  const remainingSystemIds = shuffle(
    systemPool.filter((id) => !usedSystemIds.includes(id)),
  );
  const mapSystemIds = shuffle(remainingSystemIds).slice(0, numMapTiles);

  // fill map with chosen systems
  config.modifiableMapTiles.forEach((idx) => {
    map[idx] = {
      idx: idx,
      position: mapStringOrder[idx],
      type: "SYSTEM",
      systemId: mapSystemIds.pop()!,
    };
  });

  // if we have gone past max attempts, return the map regardless of validation
  if (attempts > 1000) return { map, slices, valid: false };
  if (!validateMap(config, settings, map, slices)) {
    return coreGenerateMap(settings, systemPool, attempts + 1, generateSlices);
  }

  return { map, slices, valid: true };
}

const validateMap = (
  config: DraftConfig,
  settings: DraftSettings,
  map: Map,
  slices: SystemIds[],
) => {
  // For validating 'globals', we grab the N richest slices.
  const slicesToValidate = systemIdsToSlices(config, slices)
    .slice(0, config.numPlayers)
    .map((s) => systemIdsInSlice(s));

  const stats = calculateMapStats(slicesToValidate, map);

  const redTilesRequired = Math.floor(
    numTilesAvailable(config) * RED_TILE_RATIO,
  );

  // Use maxLegendaries from config if set, otherwise use default of 3
  const maxLegendaries =
    settings.sliceGenerationConfig?.maxLegendaries ?? 3;

  const chosenMapLocations = map.reduce(
    (acc, tile) => {
      if (tile.type === "SYSTEM") acc[tile.idx] = tile.systemId;
      return acc;
    },
    {} as Record<number, SystemId>,
  );

  return (
    stats.redTiles >= redTilesRequired &&
    stats.totalLegendary <= maxLegendaries &&
    !hasAdjacentAnomalies(chosenMapLocations)
  );
};

/**
 * A flexible core function for generating game slices with various configurations.
 * Can be used by both milty and miltyeq slice generators.
 */
export function coreGenerateSlices({
  mecatolPath,
  centerTile,
  availableSystems,
  systemTiers,
  sliceShape,
  sliceCount,
  config,
  getSliceTiers,
  validateSystems,
  validateSlice,
  postProcessSlices,
}: CoreGenerateSlicesArgs): SystemIds[] | undefined {
  const allTieredSystems = groupSystemsByTier(availableSystems, systemTiers);
  const sliceTiers: TieredSlice[] = Array.from(
    { length: sliceCount },
    getSliceTiers,
  );
  const tierCounts = sliceTiers.flat().reduce(
    (counts, tier) => {
      // NOTE: "resolved" branch should never be triggered,
      // but is currently required for the type checker
      // as the types are a bit messy.
      if (tier === "resolved") return counts;
      counts[tier] = (counts[tier] || 0) + 1;
      return counts;
    },
    { high: 0, med: 0, low: 0, red: 0 } as Record<ChoosableTier, number>,
  );

  const gatherSlices = (): SystemIds[] | undefined => {
    let slices: SystemIds[] | undefined = undefined;
    for (let i = 0; i < 100; i++) {
      const tieredSystems = gatherSystems();

      if (!tieredSystems) {
        continue;
      }

      const t_slices = gatherSlicesFromSystems(tieredSystems);

      if (t_slices) {
        slices = t_slices;
        break;
      }
    }

    return slices;
  };

  const gatherSystems = () => {
    let tieredSystems: TieredSystems | undefined = undefined;
    for (let i = 0; i < 1000; i++) {
      const shuffledTieredSystems = shuffleTieredSystems(allTieredSystems);
      const t_tieredSystems = {
        high: shuffledTieredSystems.high.slice(0, tierCounts.high),
        med: shuffledTieredSystems.med.slice(0, tierCounts.med),
        low: shuffledTieredSystems.low.slice(0, tierCounts.low),
        red: shuffledTieredSystems.red.slice(0, tierCounts.red),
      };

      // Make sure we have enough systems in each tier
      // as sometimes the weighted picks grab more tiles in a tier
      // than we have available.
      if (
        t_tieredSystems.high.length < tierCounts.high ||
        t_tieredSystems.med.length < tierCounts.med ||
        t_tieredSystems.low.length < tierCounts.low ||
        t_tieredSystems.red.length < tierCounts.red
      ) {
        continue;
      }

      if (validateSystems(t_tieredSystems, config)) {
        tieredSystems = t_tieredSystems;
        break;
      }
    }

    return tieredSystems;
  };

  const gatherSlicesFromSystems = (
    tieredSystems: TieredSystems,
  ): SystemIds[] | undefined => {
    let slices: SystemIds[] = [];
    for (let i = 0; i < 1000; i++) {
      const t_tieredSystems: TieredSystems = JSON.parse(
        JSON.stringify(tieredSystems),
      );
      t_tieredSystems.high = shuffle(t_tieredSystems.high);
      t_tieredSystems.low = shuffle(t_tieredSystems.low);
      t_tieredSystems.med = shuffle(t_tieredSystems.med);
      t_tieredSystems.red = shuffle(t_tieredSystems.red);
      for (let i = 0; i < sliceCount; i++) {
        const tierValues = sliceTiers[i];
        const slice: SystemId[] = tierValues.map(
          (tier) => t_tieredSystems[tier as ChoosableTier].shift()!,
        );
        if (!validateSlice(slice, config)) {
          break;
        }
        slices.push(shuffle(slice));
      }
      if (slices.length !== sliceCount) {
        slices = [];
      } else {
        break;
      }
    }

    return slices.length ? slices : undefined;
  };

  const slices: SystemIds[] | undefined = gatherSlices();
  if (!slices) return undefined;

  // Separate anomalies
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    let slice = slices[sliceIndex];
    slice = separateAnomalies(slice, sliceShape);
    slices[sliceIndex] = slice;
  }

  // Run any post-processing if provided
  if (postProcessSlices) {
    postProcessSlices(slices, config, mecatolPath, centerTile);
  }

  return slices;
}

// Function to check if center tile no empty and no anomaly
export function checkFirstTileToMecatolIsSafe(
  slice: SystemIds,
  centerTile?: number,
): boolean {
  // If no centerTile is specified in the config, always return true
  if (!centerTile) return true;

  // Skip if index out of bounds
  if (centerTile >= slice.length) {
    return true;
  }

  // Check if center tile in the path is an anomaly or without planets
  const systemId = slice[centerTile];
  const system = systemData[systemId];
  return !(system.anomalies.length > 0 || system.planets.length === 0);
}

// Function to check if a slice has a safe path to Mecatol
export function hasPathToMecatol(
  slice: SystemIds,
  mecatolPath: number[] | undefined,
): boolean {
  // If no mecatolPath is specified in the config, always return true
  if (!mecatolPath || mecatolPath.length === 0) return true;

  // Check if any tile in the path is an anomaly
  for (const tileIndex of mecatolPath) {
    if (tileIndex >= slice.length) continue; // Skip if index out of bounds

    const systemId = slice[tileIndex];
    const system = systemData[systemId];
    if (system.anomalies.length > 0) return false;
  }

  return true;
}

// Function to check if a slice has high-quality tiles adjacent to home
export function hasHighQualityAdjacent(
  slice: SystemIds,
  systemTiers: Record<string, ChoosableTier>,
  highTier: string = "high",
): boolean {
  // Check if any of the adjacent tiles is a high-quality (high tier) tile
  for (const tileIndex of HOME_ADJACENT_TILES) {
    if (tileIndex >= slice.length) continue; // Skip if index out of bounds

    const systemId = slice[tileIndex];
    const tier = systemTiers[systemId];

    if (tier === highTier) return true;
  }

  return false;
}

// Ensure a center tile no anomaly and with planets
export function ensureCenterTileIsSafe(
  slices: SystemIds[],
  minCenterSafeCount: number,
  centerTile?: number,
): void {
  if (!centerTile) return;

  const centerSafeSlices = slices.filter((slice) =>
    checkFirstTileToMecatolIsSafe(slice, centerTile),
  );
  if (centerSafeSlices.length >= minCenterSafeCount) return;

  // Get indices of slices without safe center
  const unsafeSliceIndices = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => !checkFirstTileToMecatolIsSafe(slice, centerTile))
    .map(({ index }) => index);

  const slicesToFix = Math.min(
    minCenterSafeCount - centerSafeSlices.length,
    unsafeSliceIndices.length,
  );

  unsafeSliceIndices.slice(0, slicesToFix).forEach((sliceIndex) => {
    const slice = [...slices[sliceIndex]];

    const centerEmptyOrAnomaly =
      centerTile < slice.length &&
      (systemData[slice[centerTile]]?.anomalies.length > 0 ||
        systemData[slice[centerTile]]?.planets.length === 0);

    const nonPathNonAnomalyOrEmptyIndices = Array.from({ length: slice.length })
      .map((_, index) => index)
      .filter((index) => centerTile !== index)
      .filter((index) => {
        const system = systemData[slice[index]];
        return system.anomalies.length === 0 && system.planets.length > 0;
      });

    const swapsNeeded = Math.min(
      centerEmptyOrAnomaly ? 1 : 0,
      nonPathNonAnomalyOrEmptyIndices.length,
    );

    for (let i = 0; i < swapsNeeded; i++) {
      const nonPathIndex = nonPathNonAnomalyOrEmptyIndices[i];

      // Swap the tiles
      [slice[centerTile], slice[nonPathIndex]] = [
        slice[nonPathIndex],
        slice[centerTile],
      ];
    }

    // Update the slice if we've fixed it
    if (checkFirstTileToMecatolIsSafe(slice, centerTile))
      slices[sliceIndex] = slice;
  });
}

// Ensure a minimum number of slices have a safe path to Mecatol
export function ensureSafePathToMecatol(
  slices: SystemIds[],
  minSafePathCount: number,
  mecatolPath: number[] | undefined,
): void {
  if (!mecatolPath || mecatolPath.length === 0) return;

  const safePathSlices = slices.filter((slice) =>
    hasPathToMecatol(slice, mecatolPath),
  );
  if (safePathSlices.length >= minSafePathCount) return;

  // Get indices of slices without safe paths
  const unsafeSliceIndices = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => !hasPathToMecatol(slice, mecatolPath))
    .map(({ index }) => index);

  const slicesToFix = Math.min(
    minSafePathCount - safePathSlices.length,
    unsafeSliceIndices.length,
  );

  unsafeSliceIndices.slice(0, slicesToFix).forEach((sliceIndex) => {
    const slice = [...slices[sliceIndex]];

    const anomaliesOnPath = mecatolPath
      .filter((pathIndex) => pathIndex < slice.length)
      .filter((pathIndex) => {
        const system = systemData[slice[pathIndex]];
        return system.anomalies.length > 0;
      });

    const nonPathNonAnomalyIndices = Array.from({ length: slice.length })
      .map((_, index) => index)
      .filter((index) => !mecatolPath.includes(index))
      .filter((index) => {
        const system = systemData[slice[index]];
        return system.anomalies.length === 0;
      });

    const swapsNeeded = Math.min(
      anomaliesOnPath.length,
      nonPathNonAnomalyIndices.length,
    );

    for (let i = 0; i < swapsNeeded; i++) {
      const pathIndex = anomaliesOnPath[i];
      const nonPathIndex = nonPathNonAnomalyIndices[i];

      // Swap the tiles
      [slice[pathIndex], slice[nonPathIndex]] = [
        slice[nonPathIndex],
        slice[pathIndex],
      ];
    }

    // Update the slice if we've fixed it
    if (hasPathToMecatol(slice, mecatolPath)) slices[sliceIndex] = slice;
  });
}

// Ensure a minimum number of slices have high-quality tiles adjacent to home
export function ensureHighQualityAdjacent(
  slices: SystemIds[],
  minHighQualityCount: number,
  systemTiers: Record<string, ChoosableTier>,
): void {
  // Create a function to check for high quality adjacency with the provided system tiers
  const hasHighQuality = (slice: SystemIds) => {
    for (const tileIndex of HOME_ADJACENT_TILES) {
      if (tileIndex >= slice.length) continue;

      const systemId = slice[tileIndex];
      const tier = systemTiers[systemId];
      if (tier === "high") return true;
    }
    return false;
  };

  // Count slices that already have high-quality adjacent tiles
  const highQualitySlices = slices.filter(hasHighQuality);

  // If we already meet the criteria, we're done
  if (highQualitySlices.length >= minHighQualityCount) return;

  // Get indices of slices without high-quality adjacent tiles
  const lowQualitySliceIndices = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => !hasHighQuality(slice))
    .map(({ index }) => index);

  // Number of slices we need to fix
  const slicesToFix = Math.min(
    minHighQualityCount - highQualitySlices.length,
    lowQualitySliceIndices.length,
  );

  // Process only as many slices as needed to meet requirements
  lowQualitySliceIndices.slice(0, slicesToFix).forEach((sliceIndex) => {
    const slice = [...slices[sliceIndex]];

    // Find indices of high-quality tiles not adjacent to home
    const highQualityIndices = Array.from({ length: slice.length })
      .map((_, index) => index)
      .filter((index) => !HOME_ADJACENT_TILES.includes(index))
      .filter((index) => systemTiers[slice[index]] === "high");

    // Find indices of non-high-quality tiles adjacent to home
    const nonHighQualityAdjacentIndices = HOME_ADJACENT_TILES.filter(
      (index) => index < slice.length,
    ).filter((index) => systemTiers[slice[index]] !== "high");

    // If we have both types of tiles, we can do a swap
    if (
      highQualityIndices.length > 0 &&
      nonHighQualityAdjacentIndices.length > 0
    ) {
      const highQualityIndex = highQualityIndices[0];
      const adjacentIndex = nonHighQualityAdjacentIndices[0];

      // Swap the tiles
      [slice[adjacentIndex], slice[highQualityIndex]] = [
        slice[highQualityIndex],
        slice[adjacentIndex],
      ];

      // Update the slice
      slices[sliceIndex] = slice;
    }
  });
}

// Regular 6p map has 36 tiles, 11 of which are red.
// This ratio is used to calculate the number of red tiles that should be required for a given map size.
export const RED_TILE_RATIO = 11 / 36;

export const numTilesAvailable = (config: DraftConfig) => {
  // subtract 1 because the center tile is not editable (mecatol rex)
  const rawTotal = ringToTiles(config.mapSize ?? 3) - 1;
  return (
    rawTotal -
    config.closedMapTiles.length -
    // only subtract preset tiles that are hyperlanes
    // as those aren't 'real' tiles.
    Object.values(config.presetTiles).filter(
      (tile) => systemData[tile.systemId].hyperlanes !== undefined,
    ).length
  );
};

export const ringToTiles = (numberRings: number): number => {
  if (numberRings < 0) return 0;
  if (numberRings === 0) return 1;

  return 1 + 3 * numberRings * (numberRings + 1);
};

/**
 * Check if there are any adjacent anomalies in the map
 */
export function hasAdjacentAnomalies(
  chosenMapLocations: Record<number, SystemId>,
): boolean {
  // For each position with a system
  for (const [posStr, systemId] of Object.entries(chosenMapLocations)) {
    // Skip if not an anomaly
    if (systemData[systemId].anomalies.length === 0) continue;

    const position = parseInt(posStr);
    const adjacentPositions = getAdjacentPositions(position);

    // Check if any adjacent system is also an anomaly
    for (const adjPos of adjacentPositions) {
      const adjSystemId = chosenMapLocations[adjPos];
      if (adjSystemId && systemData[adjSystemId].anomalies.length > 0) {
        return true; // Found adjacent anomalies
      }
    }
  }

  return false;
}
/**
 * Get positions adjacent to the given position in the hexagonal grid
 */
export function getAdjacentPositions(position: number): number[] {
  // Convert position index to actual coordinates in the hex grid
  const posCoords = mapStringOrder[position];
  if (!posCoords) return [];

  const adjacentPositions: number[] = [];

  // In a hex grid, adjacent hexes are at these relative coordinates:
  const adjacentOffsets = [
    { x: 1, y: 0, z: -1 }, // right
    { x: 1, y: -1, z: 0 }, // upper right
    { x: 0, y: -1, z: 1 }, // upper left
    { x: -1, y: 0, z: 1 }, // left
    { x: -1, y: 1, z: 0 }, // bottom left
    { x: 0, y: 1, z: -1 }, // bottom right
  ];

  // Check each adjacent direction
  for (const offset of adjacentOffsets) {
    const adjX = posCoords.x + offset.x;
    const adjY = posCoords.y + offset.y;
    const adjZ = offset.z !== undefined ? posCoords.z + offset.z : -adjX - adjY; // Calculate z if not provided

    // Find the index of this adjacent position in mapStringOrder
    const adjIndex = mapStringOrder.findIndex(
      (coords) =>
        coords.x === adjX &&
        coords.y === adjY &&
        (coords.z === adjZ ||
          (coords.z === undefined && -adjX - adjY === adjZ)),
    );

    if (adjIndex !== -1) {
      adjacentPositions.push(adjIndex);
    }
  }

  return adjacentPositions;
}

// Post-processing function for Mecatol path, safe center tile and high-quality adjacent requirements
export const postProcessSlices = (
  slices: SystemIds[],
  config: SliceGenerationConfig,
  mecatolPath?: number[],
  centerTile?: number,
) => {
  // Check for safe center tile
  if (config.centerTileNotEmpty && config.centerTileNotEmpty > 0) {
    ensureCenterTileIsSafe(slices, config.centerTileNotEmpty, centerTile);
  }

  // Check for safe path to Mecatol requirement
  if (config.safePathToMecatol && config.safePathToMecatol > 0) {
    ensureSafePathToMecatol(slices, config.safePathToMecatol, mecatolPath);
  }

  // Check for high-quality adjacent to home requirement
  if (config.highQualityAdjacent && config.highQualityAdjacent > 0) {
    ensureHighQualityAdjacent(
      slices,
      config.highQualityAdjacent,
      miltySystemTiers,
    );
  }
};
