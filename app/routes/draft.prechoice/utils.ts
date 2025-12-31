import type { ChoosableDraftType } from "./maps";
import type {
  SliceGenerationSettings,
  SliceSettingsFormatType,
} from "~/components/SliceSettingsModal";
import type { FactionId } from "~/types";

export type SliceValueRange = {
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

export const calculateSliceValueRange = (
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
function getSettingsFormatType(
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
    hasMinorFactions,
  };
};
