import type { ChoosableDraftType } from "./maps";
import type { MiltyDraftSettings } from "~/components/MiltySettingsModal";
import type { MiltyEqDraftSettings } from "~/components/MiltyEqSettingsModal";
import type { FactionId } from "~/types";

export type OptimalRange = {
  minOptimal: number | undefined;
  maxOptimal: number | undefined;
};

export const filterFactionList = (
  factions: FactionId[] | undefined,
  validPool: FactionId[],
): FactionId[] | undefined => {
  if (!factions) return undefined;
  const filtered = factions.filter((id) => validPool.includes(id));
  return filtered.length === 0 ? undefined : filtered;
};

export const calculateOptimalRange = (
  settings: { minOptimal?: number; maxOptimal?: number },
  hasMinorFactions: boolean,
): OptimalRange => {
  const minOptimal =
    hasMinorFactions && settings.minOptimal
      ? settings.minOptimal - 2
      : settings.minOptimal;

  const maxOptimal =
    hasMinorFactions && settings.maxOptimal
      ? settings.maxOptimal + 2
      : settings.maxOptimal;

  return { minOptimal, maxOptimal };
};

export const buildSliceGenerationConfig = (
  mapType: ChoosableDraftType,
  miltySettings: MiltyDraftSettings,
  miltyEqSettings: MiltyEqDraftSettings,
  hasMinorFactions: boolean,
) => {
  if (mapType === "milty") {
    const { minOptimal, maxOptimal } = calculateOptimalRange(
      miltySettings,
      hasMinorFactions,
    );

    return {
      minOptimal,
      maxOptimal,
      minOptimalInfluence: miltySettings.minOptimalInfluence,
      minOptimalResources: miltySettings.minOptimalResources,
      safePathToMecatol: miltySettings.safePathToMecatol,
      centerTileNotEmpty: miltySettings.centerTileNotEmpty,
      highQualityAdjacent: miltySettings.highQualityAdjacent,
      numAlphas: miltySettings.minAlphaWormholes,
      numBetas: miltySettings.minBetaWormholes,
      numLegendaries: miltySettings.minLegendaries,
      hasMinorFactions,
    };
  }

  if (
    mapType === "milty4p" ||
    mapType === "milty5p" ||
    mapType === "milty7p" ||
    mapType === "milty8p"
  ) {
    const { minOptimal, maxOptimal } = calculateOptimalRange(
      miltySettings,
      hasMinorFactions,
    );

    return {
      minOptimal,
      maxOptimal,
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
      minOptimal: miltyEqSettings.minOptimal,
      maxOptimal: miltyEqSettings.maxOptimal,
      minOptimalInfluence: miltyEqSettings.minOptimalInfluence,
      minOptimalResources: miltyEqSettings.minOptimalResources,
      safePathToMecatol: miltyEqSettings.safePathToMecatol,
      centerTileNotEmpty: miltyEqSettings.centerTileNotEmpty,
      highQualityAdjacent: miltyEqSettings.highQualityAdjacent,
      numAlphas: miltyEqSettings.minAlphaWormholes,
      numBetas: miltyEqSettings.minBetaWormholes,
      numLegendaries: miltyEqSettings.minLegendaries,
      hasMinorFactions,
    };
  }

  return undefined;
};
