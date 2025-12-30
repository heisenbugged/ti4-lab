import type { ChoosableDraftType } from "./maps";
import type { MiltyDraftSettings } from "~/components/MiltySettingsModal";
import type { MiltyEqDraftSettings } from "~/components/MiltyEqSettingsModal";
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

export const buildSliceGenerationConfig = (
  mapType: ChoosableDraftType,
  miltySettings: MiltyDraftSettings,
  miltyEqSettings: MiltyEqDraftSettings,
  hasMinorFactions: boolean,
) => {
  if (mapType === "milty") {
    const { minSliceValue, maxSliceValue } = calculateSliceValueRange(
      miltySettings,
      hasMinorFactions,
    );

    return {
      minSliceValue,
      maxSliceValue,
      minOptimalInfluence: miltySettings.minOptimalInfluence,
      minOptimalResources: miltySettings.minOptimalResources,
      safePathToMecatol: miltySettings.safePathToMecatol,
      centerTileNotEmpty: miltySettings.centerTileNotEmpty,
      highQualityAdjacent: miltySettings.highQualityAdjacent,
      numAlphas: miltySettings.minAlphaWormholes,
      numBetas: miltySettings.minBetaWormholes,
      minLegendaries: miltySettings.minLegendaries,
      maxLegendaries: miltySettings.maxLegendaries,
      sliceValueModifiers: { entropicScarValue: miltySettings.entropicScarValue },
      hasMinorFactions,
    };
  }

  if (
    mapType === "milty4p" ||
    mapType === "milty5p" ||
    mapType === "milty7p" ||
    mapType === "milty8p"
  ) {
    const { minSliceValue, maxSliceValue } = calculateSliceValueRange(
      miltySettings,
      hasMinorFactions,
    );

    return {
      minSliceValue,
      maxSliceValue,
      minOptimalInfluence: miltySettings.minOptimalInfluence,
      minOptimalResources: miltySettings.minOptimalResources,
      hasMinorFactions,
    };
  }

  if (
    mapType === "miltyeq" ||
    mapType === "miltyeq4p" ||
    mapType === "miltyeq7p" ||
    mapType === "miltyeq8p"
  ) {
    return {
      minSliceValue: miltyEqSettings.minSliceValue,
      maxSliceValue: miltyEqSettings.maxSliceValue,
      minOptimalInfluence: miltyEqSettings.minOptimalInfluence,
      minOptimalResources: miltyEqSettings.minOptimalResources,
      safePathToMecatol: miltyEqSettings.safePathToMecatol,
      centerTileNotEmpty: miltyEqSettings.centerTileNotEmpty,
      highQualityAdjacent: miltyEqSettings.highQualityAdjacent,
      numAlphas: miltyEqSettings.minAlphaWormholes,
      numBetas: miltyEqSettings.minBetaWormholes,
      minLegendaries: miltyEqSettings.minLegendaries,
      maxLegendaries: miltyEqSettings.maxLegendaries,
      sliceValueModifiers: { entropicScarValue: miltyEqSettings.entropicScarValue },
      hasMinorFactions,
    };
  }

  return undefined;
};
