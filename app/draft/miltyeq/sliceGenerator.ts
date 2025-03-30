import { DraftSettings, Map, SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import {
  ChoosableTier,
  DraftConfig,
  SliceChoice,
  SliceGenerationConfig,
  TieredSlice,
  TieredSystems,
} from "../types";
import { shuffle, weightedChoice } from "../helpers/randomization";
import {
  filterTieredSystems,
  isAlpha,
  isBeta,
  isLegendary,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import { generateEmptyMap, optimalStatsForSystems } from "~/utils/map";
import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "../draftConfig";
import { calculateMapStats } from "~/hooks/useFullMapStats";
import { systemIdsInSlice, systemIdsToSlices } from "~/utils/slice";
import { coreGenerateSlices } from "../common/sliceGenerator";

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

export function generateMap(
  settings: DraftSettings,
  systemPool: SystemId[],
  attempts: number = 0,
) {
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

  // if we have gone past max attempts, return the map regardless of validation
  if (attempts > 1000) return { map, slices, valid: false };

  // validate map has a minimum of 11 anomalies. only for miltyeq, as smaller map configurations
  // need different validations and haven't figured that out yet.
  if (settings.type === "miltyeq" && !validateMap(config, map, slices)) {
    return generateMap(settings, systemPool, attempts + 1);
  }

  return { map, slices, valid: true };
}

const validateMap = (config: DraftConfig, map: Map, slices: SystemIds[]) => {
  // For validating 'globals', we grab the N richest slices.
  const slicesToValidate = systemIdsToSlices(config, slices)
    .slice(0, config.numPlayers)
    .map((s) => systemIdsInSlice(s));

  const stats = calculateMapStats(slicesToValidate, map);

  return stats.redTiles >= 11 && stats.totalLegendary <= 3;
};

// Refactored to use the common implementation
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
    validateSystems: (
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
        alphas >= minAlphas &&
        betas >= minBetas &&
        legendaries >= minLegendaries
      );
    },
    validateSlice: (slice: SystemIds, config: SliceGenerationConfig) => {
      const systems = slice.map((systemId: SystemId) => systemData[systemId]);
      // can't have two alphas, two betas, or two legendaries
      const validSpecialTiles =
        systems.filter(isAlpha).length <= 1 &&
        systems.filter(isBeta).length <= 1 &&
        systems.filter(isLegendary).length <= 1;
      if (!validSpecialTiles) return false;

      const optimal = optimalStatsForSystems(systems);
      const totalOptimal = optimal.resources + optimal.influence + optimal.flex;
      if (totalOptimal > 10) return false;
      if (totalOptimal < 6) return false;

      return true;
    },
  });
