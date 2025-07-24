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
import { factionSystems, systemData } from "~/data/systemData";
import { optimalStatsForSystems } from "~/utils/map";
import {
  coreGenerateSlices,
  postProcessSlices,
} from "../common/sliceGenerator";
import { shuffle } from "../helpers/randomization";

export function generateSlices(
  sliceCount: number,
  availableSystems: SystemId[],
  config: SliceGenerationConfig = {
    numAlphas: 2,
    numBetas: 2,
    numLegendaries: 1,
    maxOptimal: undefined,
    minOptimal: undefined,
    minorFactionPool: undefined,
  },
  sliceShape: string[] = SLICE_SHAPES.milty,
  attempts: number = 0,
) {
  if (attempts > 1000) return undefined;

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

  const slices = coreGenerateSlices({
    mecatolPath: [1, 4],
    sliceCount,
    availableSystems,
    config,
    sliceShape,
    systemTiers: miltySystemTiers,
    getSliceTiers: () => ["high", "med", "low", "red", "red"],
    validateSystems,
    validateSlice,
    postProcessSlices,
  });

  if (config.hasMinorFactions && config.minorFactionPool && slices) {
    const chosenMinorFactions = shuffle(
      config.minorFactionPool.filter((faction) => faction !== "keleres"),
    ).slice(0, sliceCount);

    // from each slice, get one (at random) of the blue tiles, and replace it with the minor faction
    slices.forEach((slice) => {
      const blueTile = slice.find(
        (systemId) => systemData[systemId].type === "BLUE",
      );
      if (!blueTile) return;

      const minorFaction = chosenMinorFactions.pop()!;
      const minorFactionSystem = factionSystems[minorFaction]!;
      const blueTileIndex = slice.indexOf(blueTile);

      // Make sure minor faction is at the equidistant position
      slice[blueTileIndex] = slice[3];
      slice[3] = minorFactionSystem.id;
    });

    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      if (!validateSlice(slice, config)) {
        return generateSlices(
          sliceCount,
          availableSystems,
          config,
          sliceShape,
          attempts + 1,
        );
      }
    }
  }

  return slices;
}
