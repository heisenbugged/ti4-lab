import { System } from "./types";

export type SliceValueModifiers = {
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
};

export type SliceValueConfig = SliceValueModifiers & {
  equidistantIndices: number[];
  mecatolPathIndices: number[];
};

export const DEFAULT_SLICE_VALUE_MODIFIERS: SliceValueModifiers = {
  entropicScarValue: 2,
  techValue: 0.5,
  hopesEndValue: 2,
  emelparValue: 3,
  industrexValue: 2,
  otherLegendaryValue: 1,
  tradeStationValue: 1,
  equidistantMultiplier: 0.5,
  supernovaOnPathPenalty: -2,
  nebulaOnPathPenalty: -1,
};

const DEFAULT_SLICE_VALUE_CONFIG: SliceValueConfig = {
  ...DEFAULT_SLICE_VALUE_MODIFIERS,
  equidistantIndices: [],
  mecatolPathIndices: [],
};

export function buildSliceValueConfig(
  modifiers?: Partial<SliceValueModifiers>,
  equidistantIndices?: number[],
  mecatolPathIndices?: number[],
): Partial<SliceValueConfig> {
  return {
    ...modifiers,
    equidistantIndices: equidistantIndices ?? [],
    mecatolPathIndices: mecatolPathIndices ?? [],
  };
}

/**
 * Returns the equidistant system indices for a given draft type.
 * These are indices into the systems array (after filtering out HOME tiles).
 * In milty variants, the equidistant is the 4th system (index 3 in systems array),
 * which corresponds to tile position 4 in the slice (since HOME is at position 0).
 * In other draft types (miltyeq, heisen), equidistants are handled differently.
 */
export function getEquidistantIndices(draftType: string): number[] {
  if (
    draftType === "milty" ||
    draftType === "milty5p" ||
    draftType === "milty7p" ||
    draftType === "milty8p" ||
    draftType === "milty4p"
  ) {
    return [3];
  }
  return [];
}

/**
 * Builds a SliceValueConfig from SliceGenerationConfig.
 * Use this in generation code that has access to settings but not React hooks.
 */
export function getSliceValueConfig(
  sliceValueModifiers?: Partial<SliceValueModifiers>,
  equidistantIndices?: number[],
  mecatolPathIndices?: number[],
): Partial<SliceValueConfig> {
  return buildSliceValueConfig(sliceValueModifiers, equidistantIndices, mecatolPathIndices);
}

export const calculateSliceValue = (
  sliceSystems: System[],
  config: Partial<SliceValueConfig> = {},
) => {
  const cfg = { ...DEFAULT_SLICE_VALUE_CONFIG, ...config };
  let value = 0;

  for (let i = 0; i < sliceSystems.length; i++) {
    const system = sliceSystems[i];
    const isEquidistant = cfg.equidistantIndices.includes(i);
    const multiplier = isEquidistant ? cfg.equidistantMultiplier : 1;

    let systemValue = 0;

    systemValue +=
      system.optimalSpend.resources +
      system.optimalSpend.influence +
      system.optimalSpend.flex;

    if (system.anomalies.includes("ENTROPIC_SCAR")) {
      systemValue += cfg.entropicScarValue;
    }

    for (const planet of system.planets) {
      if (planet.tech && planet.tech.length > 0) {
        systemValue += planet.tech.length * cfg.techValue;
      }

      if (planet.legendary) {
        if (planet.name === "Hope's End") {
          systemValue += cfg.hopesEndValue;
        } else if (planet.name === "Emelpar") {
          systemValue += cfg.emelparValue;
        } else if (planet.name === "Industrex") {
          systemValue += cfg.industrexValue;
        } else {
          systemValue += cfg.otherLegendaryValue;
        }
      }

      if (planet.tradeStation) {
        systemValue += cfg.tradeStationValue;
      }
    }

    // Path-to-Mecatol anomaly penalties (applied before equidistant multiplier)
    if (cfg.mecatolPathIndices.includes(i)) {
      if (system.anomalies.includes("SUPERNOVA")) {
        systemValue += cfg.supernovaOnPathPenalty;
      }
      if (system.anomalies.includes("NEBULA")) {
        systemValue += cfg.nebulaOnPathPenalty;
      }
    }

    value += systemValue * multiplier;
  }

  return value;
};

export const valueSlice = calculateSliceValue;
