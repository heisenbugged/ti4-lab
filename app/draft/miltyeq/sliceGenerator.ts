import { DraftSettings, SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import {
  ChoosableTier,
  SliceChoice,
  SliceGenerationConfig,
  TieredSlice,
  TieredSystems,
} from "../types";
import { shuffle, weightedChoice } from "../helpers/randomization";
import {
  filterTieredSystems,
  groupSystemsByTier,
  isAlpha,
  isBeta,
  isLegendary,
  separateAnomalies,
  shuffleTieredSystems,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import { generateEmptyMap } from "~/utils/map";
import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "../draftConfig";

const SLICE_CHOICES: SliceChoice[] = [
  // 2 red
  { weight: 2, value: ["red", "red", "high", "high"] }, // 6
  { weight: 3, value: ["red", "red", "high", "med"] }, // 5
  { weight: 1, value: ["red", "red", "med", "med"] }, // 4

  // 1 red
  { weight: 2, value: ["red", "high", "med", "low"] }, // 6
  { weight: 3, value: ["red", "high", "low", "low"] }, // 5
  { weight: 2, value: ["red", "med", "med", "low"] }, // 5
  { weight: 1, value: ["red", "med", "low", "low"] }, // 4
];

const DEFAULT_SLICE_CONFIG: SliceGenerationConfig = {
  numAlphas: 2,
  numBetas: 2,
  numLegendaries: 1,
  maxOptimal: undefined,
  minOptimal: undefined,
};

export function generateMap(settings: DraftSettings, systemPool: SystemId[]) {
  const config = draftConfig[settings.type];
  const map = generateEmptyMap(config);
  const numMapTiles = config.modifiableMapTiles.length;

  const slices = generateSlices(settings.numSlices, systemPool, {
    maxOptimal: settings.maxOptimal,
    minOptimal: settings.minOptimal,
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

  return { map, slices };
}

export const generateSlices = (
  sliceCount: number,
  availableSystems: SystemId[],
  config?: SliceGenerationConfig,
) =>
  coreGenerateSlices({
    sliceCount,
    availableSystems,
    config: config ?? DEFAULT_SLICE_CONFIG,
    sliceShape: SLICE_SHAPES.milty_eq,
    systemTiers: miltySystemTiers,
    getSliceTiers: () => shuffle(weightedChoice(SLICE_CHOICES)),
    validateSystems: (systems, config) => {
      const alphas = filterTieredSystems(systems, isAlpha).length;
      const betas = filterTieredSystems(systems, isBeta).length;
      const legendaries = filterTieredSystems(systems, isLegendary).length;

      const minAlphas = config.numAlphas ?? 2;
      const minBetas = config.numBetas ?? 2;
      const minLegendaries = config.numLegendaries ?? 1;
      return (
        alphas >= minAlphas &&
        betas >= minBetas &&
        legendaries >= minLegendaries
      );
    },

    validateSlice: (slice) => {
      const systems = slice.map((systemId) => systemData[systemId]);
      // can't have two alphas, two betas, or two legendaries
      return (
        systems.filter(isAlpha).length <= 1 &&
        systems.filter(isBeta).length <= 1 &&
        systems.filter(isLegendary).length <= 1
      );

      // TODO: Maybe implement min/max optimal stats here.
    },
  });

type CoreGenerateSlicesArgs = {
  // NOTE: These are provided by draft config.
  sliceCount: number;
  sliceShape: string[];
  systemTiers: Record<string, ChoosableTier>;

  getSliceTiers: () => TieredSlice;
  validateSystems: (
    systems: TieredSystems,
    config: SliceGenerationConfig,
  ) => boolean;
  validateSlice: (slice: SystemIds, config: SliceGenerationConfig) => boolean;

  // NOTE: These are provided by user.
  availableSystems: SystemId[];
  config: SliceGenerationConfig;
};

export function coreGenerateSlices({
  availableSystems,
  systemTiers,
  sliceShape,
  sliceCount,
  config,
  getSliceTiers,
  validateSystems,
  validateSlice,
}: CoreGenerateSlicesArgs) {
  const allTieredSystems = groupSystemsByTier(availableSystems, systemTiers);

  const gatherSlices = (attempts: number = 0): SystemIds[] | undefined => {
    if (attempts > 1000) return undefined;

    const { tieredSystems, sliceTiers } = gatherSystems() ?? {
      tieredSystems: undefined,
      sliceTiers: undefined,
    };
    if (!tieredSystems) return undefined;

    const slices: SystemIds[] = [];
    for (let i = 0; i < sliceCount; i++) {
      const tierValues = sliceTiers[i];
      const slice: SystemId[] = tierValues.map(
        (tier) => tieredSystems[tier as ChoosableTier].shift()!,
      );
      if (!validateSlice(slice, config)) return gatherSlices(attempts + 1);
      slices.push(shuffle(slice));
    }

    return slices;
  };

  const gatherSystems = (attempts: number = 0) => {
    if (attempts > 1000) return undefined;

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

    const shuffledTieredSystems = shuffleTieredSystems(allTieredSystems);
    const tieredSystems = {
      high: shuffledTieredSystems.high.slice(0, tierCounts.high),
      med: shuffledTieredSystems.med.slice(0, tierCounts.med),
      low: shuffledTieredSystems.low.slice(0, tierCounts.low),
      red: shuffledTieredSystems.red.slice(0, tierCounts.red),
    };

    if (!validateSystems(tieredSystems, config)) {
      return gatherSystems(attempts + 1);
    }

    return { sliceTiers, tieredSystems };
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
