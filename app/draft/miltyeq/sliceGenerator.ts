import { DraftSettings, SystemId, SystemIds, FactionId } from "~/types";
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
import { generateEmptyMap, optimalStatsForSystems } from "~/utils/map";
import {
  coreGenerateMap,
  coreGenerateSlices,
  postProcessSlices,
} from "../common/sliceGenerator";
import {
  getMiltyEqSettings,
  type MiltyEqConstraints,
} from "~/components/MiltyEqSettingsModal";
import { draftConfig } from "../draftConfig";
import { getFactionPool } from "~/utils/factions";
import { mapStringOrder } from "~/data/mapStringOrder";

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

// force 2 red for minor factions
// as all equidistants are forced to be essentially 'blue' tiles.
const MINOR_FACTION_SLICE_CHOICES: SliceChoice[] = [
  { weight: 2, value: ["red", "red", "high", "high"] }, // 6
  { weight: 3, value: ["red", "red", "high", "med"] }, // 5
  { weight: 1, value: ["red", "red", "med", "med"] }, // 4
];

const getDefaultConfig = (availableSystems: SystemId[]) => {
  // Compute constraints from the available system pool
  const systems = availableSystems.map((id) => systemData[id]);

  const alphaCount = systems.filter((system) =>
    system.wormholes.includes("ALPHA"),
  ).length;

  const betaCount = systems.filter((system) =>
    system.wormholes.includes("BETA"),
  ).length;

  const legendaryCount = systems.filter((system) =>
    system.planets.some((planet) => planet.legendary),
  ).length;

  // Calculate optimal constraints for miltyeq (4 systems per slice)
  const optimalValues = systems.map((system) => {
    const optimal = optimalStatsForSystems([system]);
    return optimal.resources + optimal.influence + optimal.flex;
  });

  optimalValues.sort((a, b) => a - b);

  const miltyEqSystemsPerSlice = 4;
  const miltyEqMinOptimal = optimalValues
    .slice(0, miltyEqSystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);
  const miltyEqMaxOptimal = optimalValues
    .slice(-miltyEqSystemsPerSlice)
    .reduce((sum, val) => sum + val, 0);

  // Add buffer for more realistic ranges
  const buffer = Math.max(
    1,
    Math.floor((miltyEqMaxOptimal - miltyEqMinOptimal) * 0.1),
  );

  const constraints: MiltyEqConstraints = {
    maxAlphaWormholes: alphaCount,
    maxBetaWormholes: betaCount,
    maxLegendaries: legendaryCount,
    minOptimal: Math.max(0, miltyEqMinOptimal - buffer),
    maxOptimal: miltyEqMaxOptimal + buffer,
  };

  return getMiltyEqSettings(constraints);
};

export const generateMap = (
  settings: DraftSettings,
  systemPool: SystemId[],
  minorFactionPool?: FactionId[],
  attempts: number = 0,
) => {
  const config = draftConfig[settings.type];
  const minorFactionsMode = settings.minorFactionsMode;
  if (
    minorFactionsMode?.mode === "sharedPool" ||
    minorFactionsMode?.mode === "separatePool"
  ) {
    const slices = generateSlices(
      settings.numSlices,
      systemPool,
      settings.sliceGenerationConfig,
    );
    if (slices === undefined) return undefined;
    return {
      map: generateEmptyMap(draftConfig[settings.type]),
      slices,
      valid: slices !== undefined,
    };
  }
  if (minorFactionsMode?.mode === "random") {
    const slices = generateSlices(
      settings.numSlices,
      systemPool,
      settings.sliceGenerationConfig,
    );
    if (slices === undefined) return undefined;

    const map = generateEmptyMap(config);
    const factionPool = shuffle(
      // keleres is weird and does not have a home system so we exclude it
      getFactionPool(settings.factionGameSets).filter((id) => id !== "keleres"),
      config.numPlayers,
    );

    factionPool.forEach((faction, idx) => {
      const factionSystem = Object.values(systemData).find(
        (system) => system.faction === faction,
      );
      if (!factionSystem) throw new Error(`Faction ${faction} not found`);

      const minorFactionsEqPositions = config.minorFactionsEqPositions;
      if (!minorFactionsEqPositions) return;

      map[minorFactionsEqPositions[idx]] = {
        idx: minorFactionsEqPositions[idx],
        position: mapStringOrder[minorFactionsEqPositions[idx]],
        type: "SYSTEM",
        systemId: factionSystem.id,
      };
    });

    return {
      map,
      slices,
      valid: true,
    };
  }

  return coreGenerateMap(settings, systemPool, attempts, generateSlices);
};

export const generateSlices = (
  sliceCount: number,
  availableSystems: SystemId[],
  config?: SliceGenerationConfig,
) => {
  const defaultConfig = getDefaultConfig(availableSystems);
  const finalConfig = { ...defaultConfig, ...config };

  return coreGenerateSlices({
    mecatolPath: [1, 3],
    sliceCount,
    availableSystems,
    config: finalConfig,
    sliceShape: SLICE_SHAPES.milty_eq,
    systemTiers: miltySystemTiers,
    getSliceTiers: () => {
      if (config?.hasMinorFactions)
        return shuffle(weightedChoice(MINOR_FACTION_SLICE_CHOICES));

      return shuffle(weightedChoice(SLICE_CHOICES));
    },
    validateSystems: (systems: TieredSystems) => {
      const alphas = filterTieredSystems(systems, isAlpha).length;
      const betas = filterTieredSystems(systems, isBeta).length;
      const legendaries = filterTieredSystems(systems, isLegendary).length;

      return (
        alphas >= finalConfig.minAlphaWormholes &&
        betas >= finalConfig.minBetaWormholes &&
        legendaries >= finalConfig.minLegendaries
      );
    },
    validateSlice: (slice: SystemIds) => {
      const systems = slice.map((systemId: SystemId) => systemData[systemId]);
      // can't have two alphas, two betas, or two legendaries
      const validSpecialTiles =
        systems.filter(isAlpha).length <= 1 &&
        systems.filter(isBeta).length <= 1 &&
        systems.filter(isLegendary).length <= 1;
      if (!validSpecialTiles) return false;

      const optimal = optimalStatsForSystems(systems);
      const totalOptimal = optimal.resources + optimal.influence + optimal.flex;

      if (
        finalConfig.maxOptimal !== undefined &&
        totalOptimal > finalConfig.maxOptimal
      )
        return false;
      if (
        finalConfig.minOptimal !== undefined &&
        totalOptimal < finalConfig.minOptimal
      )
        return false;

      return true;
    },
    postProcessSlices,
  });
};
