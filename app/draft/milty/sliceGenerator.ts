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

  // finally, we separate anomalies
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    let slice = slices[sliceIndex];
    slice = separateAnomalies(slice, sliceShape);
    slices[sliceIndex] = slice;
  }

  return slices;
}
