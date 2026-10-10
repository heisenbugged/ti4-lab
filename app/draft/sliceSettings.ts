// Slice generation settings: types and per-format defaults. Pure data, no UI, so the server-side generators can import it.
import { DEFAULT_SLICE_VALUE_MODIFIERS } from "~/stats";

export type SliceSettingsFormatType = "milty" | "miltyeq" | "heisen";

export interface SliceGenerationSettings {
  minSliceValue?: number;
  maxSliceValue?: number;
  minOptimalInfluence?: number;
  minOptimalResources?: number;

  safePathToMecatol: number;
  centerTileNotEmpty: number;
  highQualityAdjacent: number;
  minAlphaWormholes: number;
  minBetaWormholes: number;
  minLegendaries: number;
  maxLegendaries?: number;

  // Slice value modifiers
  entropicScarValue: number;
  techValue: number;
  hopesEndValue: number;
  emelparValue: number;
  industrexValue: number;
  otherLegendaryValue: number;
  tradeStationValue: number;
  equidistantMultiplier: number;
  supernovaOnPathPenalty: number;
  nebulaOnPathPenalty: number;
}

export const DEFAULT_SLICE_SETTINGS: Record<
  SliceSettingsFormatType,
  SliceGenerationSettings
> = {
  milty: {
    minOptimalInfluence: 4,
    minOptimalResources: 3,
    minSliceValue: 9,
    maxSliceValue: 13,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 2,
    minBetaWormholes: 2,
    minLegendaries: 1,
    maxLegendaries: 3,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
  miltyeq: {
    minOptimalInfluence: 3,
    minOptimalResources: 2,
    minSliceValue: 6,
    maxSliceValue: 10,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 2,
    minBetaWormholes: 2,
    minLegendaries: 1,
    maxLegendaries: 3,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
  heisen: {
    minOptimalInfluence: 0,
    minOptimalResources: 0,
    minSliceValue: 4,
    maxSliceValue: 10,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 0,
    minBetaWormholes: 0,
    minLegendaries: 0,
    maxLegendaries: undefined,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
};
