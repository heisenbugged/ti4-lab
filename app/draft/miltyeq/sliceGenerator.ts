import { DraftSettings, SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import { SliceChoice, SliceGenerationConfig, TieredSystems } from "../types";
import { shuffle, weightedChoice } from "../helpers/randomization";
import {
  filterTieredSystems,
  isAlpha,
  isBeta,
  isLegendary,
} from "../helpers/sliceGeneration";
import { systemData } from "~/data/systemData";
import { optimalStatsForSystems } from "~/utils/map";
import {
  coreGenerateMap,
  coreGenerateSlices,
  postProcessSlices,
} from "../common/sliceGenerator";
import { DEFAULT_MILTYEQ_SETTINGS } from "~/components/MiltyEqSettingsModal";

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

const DEFAULT_CONFIG = DEFAULT_MILTYEQ_SETTINGS;

export const generateMap = (
  settings: DraftSettings,
  systemPool: SystemId[],
  attempts: number = 0,
) => coreGenerateMap(settings, systemPool, attempts, generateSlices);

export const generateSlices = (
  sliceCount: number,
  availableSystems: SystemId[],
  config?: SliceGenerationConfig,
) =>
  coreGenerateSlices({
    mecatolPath: [1, 3],
    sliceCount,
    availableSystems,
    config: config ?? DEFAULT_CONFIG,
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

      const minAlphas = config.numAlphas ?? DEFAULT_CONFIG.minAlphaWormholes;
      const minBetas = config.numBetas ?? DEFAULT_CONFIG.minBetaWormholes;
      const minLegendaries =
        config.numLegendaries ?? DEFAULT_CONFIG.minLegendaries;
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

      const minOptimal = config.minOptimal ?? DEFAULT_CONFIG.minOptimal;
      const maxOptimal = config.maxOptimal ?? DEFAULT_CONFIG.maxOptimal;

      if (maxOptimal !== undefined && totalOptimal > maxOptimal) return false;
      if (minOptimal !== undefined && totalOptimal < minOptimal) return false;

      return true;
    },
    postProcessSlices,
  });
