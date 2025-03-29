import { SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import { ChoosableTier, SliceGenerationConfig, TieredSystems } from "../types";
import { shuffle } from "../helpers/randomization";
import {
  filterTieredSystems,
  isAlpha,
  isBeta,
  isLegendary,
  separateAnomalies,
  shuffleTieredSystems,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import { optimalStatsForSystems } from "~/utils/map";

// Define the path indices to Mecatol - these are the same for all slices
// Represents the straight line path from home system to the center
// This is the standard path for any slice
const MECATOL_PATH = [1, 4];

// Define which tiles are adjacent to home systems
const HOME_ADJACENT_TILES = [1, 2, 3]; // Indices in the slice array for tiles adjacent to home

export function generateSlices(
  sliceCount: number,
  availableSystems: SystemId[],
  config: SliceGenerationConfig = {
    numAlphas: 2,
    numBetas: 2,
    numLegendaries: 1,
    maxOptimal: undefined,
    minOptimal: undefined,
  },
  sliceShape: string[] = SLICE_SHAPES.milty,
) {
  const allTieredSystems = availableSystems.reduce(
    (acc, id) => {
      const tier = miltySystemTiers[id];
      if (acc[tier]) {
        acc[tier].push(id);
      } else {
        acc[tier] = [id];
      }
      return acc;
    },
    {} as Record<ChoosableTier, SystemId[]>,
  );
  const minAlphas = config.numAlphas ?? 2;
  const minBetas = config.numBetas ?? 2;
  const minLegendaries = config.numLegendaries ?? 1;

  const gatherSlices = (attempts: number = 0): SystemIds[] | undefined => {
    if (attempts > 1000) return undefined;

    const tieredSystems = gatherSystems();
    if (!tieredSystems) return undefined;

    const slices: SystemIds[] = [];
    for (let i = 0; i < sliceCount; i++) {
      const slice = shuffle([
        tieredSystems.high[i],
        tieredSystems.med[i],
        tieredSystems.low[i],
        tieredSystems.red[2 * i],
        tieredSystems.red[2 * i + 1],
      ]);
      if (!validateSlice(slice)) return gatherSlices(attempts + 1);
      slices.push(slice);
    }

    return slices;
  };

  const gatherSystems = (attempts: number = 0): TieredSystems | undefined => {
    if (attempts > 1000) return undefined;

    const shuffledTieredSystems = shuffleTieredSystems(allTieredSystems);
    const tieredSystems = {
      high: shuffledTieredSystems.high.slice(0, sliceCount),
      med: shuffledTieredSystems.med.slice(0, sliceCount),
      low: shuffledTieredSystems.low.slice(0, sliceCount),
      red: shuffledTieredSystems.red.slice(0, sliceCount * 2),
    };

    const alphas = filterTieredSystems(tieredSystems, isAlpha).length;
    const betas = filterTieredSystems(tieredSystems, isBeta).length;
    const legendaries = filterTieredSystems(tieredSystems, isLegendary).length;

    if (alphas < minAlphas || betas < minBetas || legendaries < minLegendaries)
      return gatherSystems(attempts + 1);

    return tieredSystems;
  };

  const validateSlice = (slice: SystemIds) => {
    const systems = slice.map((systemId) => systemData[systemId]);

    // can't have 2 alpha, beta or legendaries
    if (
      systems.filter(isAlpha).length > 1 ||
      systems.filter(isBeta).length > 1 ||
      systems.filter(isLegendary).length > 1
    ) {
      return false;
    }

    // check optimal values.
    const optimal = optimalStatsForSystems(systems);

    const totalOptimal = optimal.resources + optimal.influence + optimal.flex;
    if (config.maxOptimal && totalOptimal > config.maxOptimal) return false;
    if (config.minOptimal && totalOptimal < config.minOptimal) return false;

    return true;
  };

  const slices: SystemIds[] | undefined = gatherSlices();
  if (!slices) return undefined;

  // separate anomalies
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    let slice = slices[sliceIndex];
    slice = separateAnomalies(slice, sliceShape);
    slices[sliceIndex] = slice;
  }

  // Check for safe path to Mecatol requirement
  if (config.safePathToMecatol && config.safePathToMecatol > 0) {
    ensureSafePathToMecatol(slices, config.safePathToMecatol);
  }

  // Check for high-quality adjacent to home requirement
  if (config.highQualityAdjacent && config.highQualityAdjacent > 0) {
    ensureHighQualityAdjacent(slices, config.highQualityAdjacent);
  }

  return slices;
}

// Function to check if a slice has a safe path to Mecatol
function hasPathToMecatol(slice: SystemIds): boolean {
  // Check if any tile in the path is an anomaly
  for (const tileIndex of MECATOL_PATH) {
    if (tileIndex >= slice.length) continue; // Skip if index out of bounds

    const systemId = slice[tileIndex];
    const system = systemData[systemId];
    if (system.anomalies.length > 0) return false;
  }

  return true;
}

// Function to check if a slice has high-quality tiles adjacent to home
function hasHighQualityAdjacent(slice: SystemIds): boolean {
  // Check if any of the adjacent tiles is a high-quality (high tier) tile
  for (const tileIndex of HOME_ADJACENT_TILES) {
    if (tileIndex >= slice.length) continue; // Skip if index out of bounds

    const systemId = slice[tileIndex];
    const tier = miltySystemTiers[systemId];
    if (tier === "high") return true;
  }

  return false;
}

// Ensure a minimum number of slices have a safe path to Mecatol
function ensureSafePathToMecatol(
  slices: SystemIds[],
  minSafePathCount: number,
): void {
  // Count slices that already have a safe path
  const safePathSlices = slices.filter(hasPathToMecatol);

  // If we already meet the criteria, we're done
  if (safePathSlices.length >= minSafePathCount) return;

  // Get indices of slices without safe paths
  const unsafeSliceIndices = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => !hasPathToMecatol(slice))
    .map(({ index }) => index);

  // Number of slices we need to fix
  const slicesToFix = Math.min(
    minSafePathCount - safePathSlices.length,
    unsafeSliceIndices.length,
  );

  // Process only as many slices as needed to meet requirements
  unsafeSliceIndices.slice(0, slicesToFix).forEach((sliceIndex) => {
    // Create a modified copy of the slice
    const slice = [...slices[sliceIndex]];

    // Find all anomalies on the path
    const anomaliesOnPath = MECATOL_PATH.filter(
      (pathIndex) => pathIndex < slice.length,
    ).filter((pathIndex) => {
      const system = systemData[slice[pathIndex]];
      return system.anomalies.length > 0;
    });

    // Find all non-path indices that aren't anomalies
    const nonPathNonAnomalyIndices = Array.from({ length: slice.length })
      .map((_, index) => index)
      .filter((index) => !MECATOL_PATH.includes(index))
      .filter((index) => {
        const system = systemData[slice[index]];
        return system.anomalies.length === 0;
      });

    // Perform swaps to fix the path if possible
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
    if (hasPathToMecatol(slice)) slices[sliceIndex] = slice;
  });
}

// Ensure a minimum number of slices have high-quality tiles adjacent to home
function ensureHighQualityAdjacent(
  slices: SystemIds[],
  minHighQualityCount: number,
): void {
  // Count slices that already have high-quality adjacent tiles
  const highQualitySlices = slices.filter(hasHighQualityAdjacent);

  // If we already meet the criteria, we're done
  if (highQualitySlices.length >= minHighQualityCount) return;

  // Get indices of slices without high-quality adjacent tiles
  const lowQualitySliceIndices = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => !hasHighQualityAdjacent(slice))
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
      .filter((index) => miltySystemTiers[slice[index]] === "high");

    // Find indices of non-high-quality tiles adjacent to home
    const nonHighQualityAdjacentIndices = HOME_ADJACENT_TILES.filter(
      (index) => index < slice.length,
    ).filter((index) => miltySystemTiers[slice[index]] !== "high");

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
