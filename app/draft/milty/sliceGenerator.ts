import { SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import { SliceGenerationConfig, TieredSystems } from "../types";
import {
  filterTieredSystems,
  isAlpha,
  isBeta,
  isLegendary,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import { optimalStatsForSystems } from "~/utils/map";
import {
  coreGenerateSlices,
  ensureSafePathToMecatol,
  ensureHighQualityAdjacent,
} from "../common/sliceGenerator";

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
  // Validation function for systems
  const validateSystems = (
    systems: TieredSystems,
    config: SliceGenerationConfig,
  ) => {
    const alphas = filterTieredSystems(systems, isAlpha).length;
    const betas = filterTieredSystems(systems, isBeta).length;
    const legendaries = filterTieredSystems(systems, isLegendary).length;

    const minAlphas = config.numAlphas ?? 2;
    const minBetas = config.numBetas ?? 2;
    const minLegendaries = config.numLegendaries ?? 1;

    return (
      alphas >= minAlphas && betas >= minBetas && legendaries >= minLegendaries
    );
  };

  // Validation function for a single slice
  const validateSlice = (slice: SystemIds, config: SliceGenerationConfig) => {
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

  // Post-processing function for Mecatol path and high-quality adjacent requirements
  const postProcessSlices = (
    slices: SystemIds[],
    config: SliceGenerationConfig,
  ) => {
    // Check for safe path to Mecatol requirement
    if (config.safePathToMecatol && config.safePathToMecatol > 0) {
      console.log("Ensuring safe path to Mecatol");
      ensureSafePathToMecatol(slices, config.safePathToMecatol);
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

  return coreGenerateSlices({
    sliceCount,
    availableSystems,
    config,
    sliceShape,
    systemTiers: miltySystemTiers,
    // milty always returns the same structure: [high, med, low, red, red]
    getSliceTiers: () => ["high", "med", "low", "red", "red"],
    validateSystems,
    validateSlice,
    postProcessSlices,
  });
}
