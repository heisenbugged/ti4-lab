import { Planet, System } from "./types";

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

/**
 * Heisen/Nucleus core slices are [ring 1, ring 2, ring 2] around Mecatol:
 * the ring 1 tile is on the path to Rex and both ring 2 tiles are shared.
 */
export const CORE_SLICE_VALUE_CONFIG: Pick<
  SliceValueConfig,
  "equidistantIndices" | "mecatolPathIndices"
> = {
  equidistantIndices: [1, 2],
  mecatolPathIndices: [0],
};

export type SliceValueModifier = {
  label: string;
  value: number;
  count?: number;
  /** If this modifier is reduced due to equidistant sharing */
  equidistantShared?: number; // Number of homes sharing this system
};

export type SliceValueBreakdown = {
  total: number;
  optimal: {
    resources: number;
    influence: number;
    flex: number;
    sum: number;
  };
  equidistantPenalty: number | null;
  equidistantMultiplier: number;
  modifiers: SliceValueModifier[];
};

export type SystemValue = {
  /** Optimal spend of the system's planets (flex = planets with R = I). */
  optimal: SliceValueBreakdown["optimal"];
  /** Modifiers applied to this system; a tech skip row, if any, is first. */
  modifiers: SliceValueModifier[];
  /** Optimal sum plus all modifiers, before any equidistant sharing. */
  total: number;
};

export const TECH_SKIPS_LABEL = "Tech Skips";

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

function legendaryValue(planet: Planet, modifiers: SliceValueModifiers) {
  switch (planet.name) {
    case "Hope's End":
      return modifiers.hopesEndValue;
    case "Emelpar":
      return modifiers.emelparValue;
    case "Industrex":
      return modifiers.industrexValue;
    default:
      return modifiers.otherLegendaryValue;
  }
}

/**
 * Value of a single system: its optimal spend plus tech skip, legendary,
 * trade station and entropic scar bonuses, plus supernova/nebula penalties
 * when the system sits on the slice's path to Mecatol Rex.
 */
export function evaluateSystem(
  system: System,
  modifiers: SliceValueModifiers = DEFAULT_SLICE_VALUE_MODIFIERS,
  onMecatolPath = false,
): SystemValue {
  const { resources, influence, flex } = system.optimalSpend;
  const optimalSum = resources + influence + flex;
  const applied: SliceValueModifier[] = [];
  let total = optimalSum;
  let techSkipCount = 0;
  let techSkipValue = 0;

  if (system.anomalies.includes("ENTROPIC_SCAR")) {
    total += modifiers.entropicScarValue;
  }

  for (const planet of system.planets) {
    if (planet.tech && planet.tech.length > 0) {
      const value = planet.tech.length * modifiers.techValue;
      techSkipCount += planet.tech.length;
      techSkipValue += value;
      total += value;
    }

    if (planet.legendary) {
      const value = legendaryValue(planet, modifiers);
      applied.push({ label: planet.name || "Legendary", value });
      total += value;
    }

    if (planet.tradeStation) {
      applied.push({ label: "Trade Station", value: modifiers.tradeStationValue });
      total += modifiers.tradeStationValue;
    }
  }

  if (techSkipCount > 0) {
    applied.unshift({
      label: TECH_SKIPS_LABEL,
      value: techSkipValue,
      count: techSkipCount,
    });
  }

  if (system.anomalies.includes("ENTROPIC_SCAR")) {
    applied.push({ label: "Entropic Scar", value: modifiers.entropicScarValue });
  }

  if (onMecatolPath) {
    if (system.anomalies.includes("SUPERNOVA")) {
      applied.push({
        label: "Supernova on Path",
        value: modifiers.supernovaOnPathPenalty,
      });
      total += modifiers.supernovaOnPathPenalty;
    }
    if (system.anomalies.includes("NEBULA")) {
      applied.push({
        label: "Nebula on Path",
        value: modifiers.nebulaOnPathPenalty,
      });
      total += modifiers.nebulaOnPathPenalty;
    }
  }

  return {
    optimal: { resources, influence, flex, sum: optimalSum },
    modifiers: applied,
    total,
  };
}

function evaluateSliceSystems(
  sliceSystems: System[],
  config: Partial<SliceValueConfig>,
) {
  const cfg = { ...DEFAULT_SLICE_VALUE_CONFIG, ...config };
  return {
    cfg,
    evaluated: sliceSystems.map((system, i) => ({
      value: evaluateSystem(system, cfg, cfg.mecatolPathIndices.includes(i)),
      isEquidistant: cfg.equidistantIndices.includes(i),
    })),
  };
}

export function calculateSliceValue(
  sliceSystems: System[],
  config: Partial<SliceValueConfig> = {},
): number {
  const { cfg, evaluated } = evaluateSliceSystems(sliceSystems, config);
  let value = 0;
  for (const { value: systemValue, isEquidistant } of evaluated) {
    const multiplier = isEquidistant ? cfg.equidistantMultiplier : 1;
    value += systemValue.total * multiplier;
  }
  return value;
}

/**
 * Breakdown of a slice's value for display. Tech skips across the slice are
 * merged into a single leading row; equidistant systems contribute their
 * full value to the rows and the reduction is reported as equidistantPenalty.
 */
export function calculateBreakdown(
  sliceSystems: System[],
  config: Partial<SliceValueConfig> = {},
): SliceValueBreakdown {
  const { cfg, evaluated } = evaluateSliceSystems(sliceSystems, config);

  const optimal = { resources: 0, influence: 0, flex: 0, sum: 0 };
  const modifiers: SliceValueModifier[] = [];
  let techSkipCount = 0;
  let techSkipValue = 0;
  let equidistantPenalty = 0;

  for (const { value: systemValue, isEquidistant } of evaluated) {
    optimal.resources += systemValue.optimal.resources;
    optimal.influence += systemValue.optimal.influence;
    optimal.flex += systemValue.optimal.flex;

    for (const modifier of systemValue.modifiers) {
      if (modifier.label === TECH_SKIPS_LABEL) {
        techSkipCount += modifier.count ?? 0;
        techSkipValue += modifier.value;
      } else {
        modifiers.push(modifier);
      }
    }

    if (isEquidistant) {
      equidistantPenalty +=
        systemValue.total * (1 - cfg.equidistantMultiplier);
    }
  }

  if (techSkipCount > 0) {
    modifiers.unshift({
      label: TECH_SKIPS_LABEL,
      value: techSkipValue,
      count: techSkipCount,
    });
  }

  optimal.sum = optimal.resources + optimal.influence + optimal.flex;
  const modifiersSum = modifiers.reduce((acc, m) => acc + m.value, 0);

  return {
    total: optimal.sum + modifiersSum - equidistantPenalty,
    optimal,
    equidistantPenalty: equidistantPenalty > 0 ? equidistantPenalty : null,
    equidistantMultiplier: cfg.equidistantMultiplier,
    modifiers,
  };
}
