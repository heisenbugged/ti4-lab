import type { ChoosableDraftType } from "./maps";
import type {
  SliceGenerationSettings,
  SliceSettingsFormatType,
} from "~/draft/sliceSettings";
import type { FactionId, GameSet, SystemId } from "~/types";
import { draftConfig } from "~/draft";
import { getSystemPool } from "~/utils/system";
import { systemData } from "~/data/systemData";

type SliceValueRange = {
  minSliceValue: number | undefined;
  maxSliceValue: number | undefined;
};

export const filterFactionList = (
  factions: FactionId[] | undefined,
  validPool: FactionId[],
): FactionId[] | undefined => {
  if (!factions) return undefined;
  const filtered = factions.filter((id) => validPool.includes(id));
  return filtered.length === 0 ? undefined : filtered;
};

const calculateSliceValueRange = (
  settings: { minSliceValue?: number; maxSliceValue?: number },
  hasMinorFactions: boolean,
): SliceValueRange => {
  const minSliceValue =
    hasMinorFactions && settings.minSliceValue
      ? settings.minSliceValue - 2
      : settings.minSliceValue;

  const maxSliceValue =
    hasMinorFactions && settings.maxSliceValue
      ? settings.maxSliceValue + 2
      : settings.maxSliceValue;

  return { minSliceValue, maxSliceValue };
};

// Determine which settings format to use based on map type
export function getSettingsFormatType(
  mapType: ChoosableDraftType,
): SliceSettingsFormatType | null {
  if (mapType.startsWith("miltyeq")) return "miltyeq";
  if (mapType.startsWith("milty")) return "milty";
  if (mapType.startsWith("heisen")) return "heisen";
  return null;
}

export const buildSliceGenerationConfig = (
  mapType: ChoosableDraftType,
  sliceSettings: Record<SliceSettingsFormatType, SliceGenerationSettings>,
  hasMinorFactions: boolean,
) => {
  const formatType = getSettingsFormatType(mapType);
  if (!formatType) return undefined;

  const settings = sliceSettings[formatType];
  const config = draftConfig[formatType];
  const { minSliceValue, maxSliceValue } = calculateSliceValueRange(
    settings,
    hasMinorFactions,
  );

  return {
    minSliceValue,
    maxSliceValue,
    minOptimalInfluence: settings.minOptimalInfluence,
    minOptimalResources: settings.minOptimalResources,
    safePathToMecatol: settings.safePathToMecatol,
    centerTileNotEmpty: settings.centerTileNotEmpty,
    highQualityAdjacent: settings.highQualityAdjacent,
    numAlphas: settings.minAlphaWormholes,
    numBetas: settings.minBetaWormholes,
    minLegendaries: settings.minLegendaries,
    maxLegendaries: settings.maxLegendaries,
    sliceValueModifiers: {
      entropicScarValue: settings.entropicScarValue,
      techValue: settings.techValue,
      hopesEndValue: settings.hopesEndValue,
      emelparValue: settings.emelparValue,
      industrexValue: settings.industrexValue,
      otherLegendaryValue: settings.otherLegendaryValue,
      tradeStationValue: settings.tradeStationValue,
      equidistantMultiplier: settings.equidistantMultiplier,
      supernovaOnPathPenalty: settings.supernovaOnPathPenalty,
      nebulaOnPathPenalty: settings.nebulaOnPathPenalty,
    },
    mecatolPathSystemIndices: config.mecatolPathSystemIndices,
    hasMinorFactions,
  };
};

type SliceTileRequirements = {
  total: number;
  red: number;
  blue: number;
};

/**
 * Heuristic slice cap rules.
 *
 * We intentionally keep this cheap and deterministic:
 * 1. Every map type has a fixed number of tiles per slice.
 * 2. Every map family also has a minimum red/blue mix that its generators aim for.
 * 3. The largest legal pool is the smallest of:
 *    - how many full slices the total tile count can fill
 *    - how many slices the red tile pool can support
 *    - how many slices the blue tile pool can support
 *
 * This is only a pool-size heuristic for the UI cap. It does not try to model
 * wormholes, legendaries, value constraints, or generator randomness.
 */
function getMinimumTileRequirementsPerSlice(
  mapType: ChoosableDraftType,
  hasMinorFactions: boolean,
): SliceTileRequirements {
  const total = draftConfig[mapType].numSystemsInSlice;

  if (mapType.startsWith("miltyeq")) {
    return hasMinorFactions
      ? { total, red: 2, blue: 2 }
      : { total, red: 1, blue: 3 };
  }

  if (mapType.startsWith("milty")) {
    return { total, red: 2, blue: 3 };
  }

  return { total, red: 1, blue: 2 };
}

function countTileColors(systemPool: SystemId[]) {
  const red = systemPool.filter((id) => systemData[id].type === "RED").length;
  return {
    total: systemPool.length,
    red,
    blue: systemPool.length - red,
  };
}

function getSliceCandidateUpperBound(
  mapType: ChoosableDraftType,
  systemPool: SystemId[],
  hasMinorFactions: boolean,
) {
  const pool = countTileColors(systemPool);
  const requirements = getMinimumTileRequirementsPerSlice(
    mapType,
    hasMinorFactions,
  );

  return Math.min(
    Math.floor(pool.total / requirements.total),
    Math.floor(pool.red / requirements.red),
    Math.floor(pool.blue / requirements.blue),
  );
}

export function getMaxAvailableSlices(
  mapType: ChoosableDraftType,
  tileGameSets: GameSet[],
  hasMinorFactions: boolean,
) {
  const systemPool = getSystemPool(tileGameSets);
  return getSliceCandidateUpperBound(mapType, systemPool, hasMinorFactions);
}
