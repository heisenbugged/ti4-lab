import { Slice, System } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValueConfig } from "./useSliceValue";
import {
  DEFAULT_SLICE_VALUE_MODIFIERS,
  SliceValueConfig,
} from "~/stats";

export type SliceValueModifier = {
  label: string;
  value: number;
  count?: number;
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

function calculateBreakdown(
  systems: System[],
  config: Partial<SliceValueConfig>,
): SliceValueBreakdown {
  const cfg = { ...DEFAULT_SLICE_VALUE_MODIFIERS, equidistantIndices: [], mecatolPathIndices: [], ...config };

  let optimalResources = 0;
  let optimalInfluence = 0;
  let optimalFlex = 0;
  let equidistantPenalty = 0;

  const modifiers: SliceValueModifier[] = [];
  let techSkipCount = 0;
  let techSkipValue = 0;

  for (let i = 0; i < systems.length; i++) {
    const system = systems[i];
    const isEquidistant = cfg.equidistantIndices.includes(i);

    // Base optimal values (always add full values)
    const sysResources = system.optimalSpend.resources;
    const sysInfluence = system.optimalSpend.influence;
    const sysFlex = system.optimalSpend.flex;

    optimalResources += sysResources;
    optimalInfluence += sysInfluence;
    optimalFlex += sysFlex;

    // Track full system value for equidistant penalty calculation
    let systemModifiersValue = 0;

    // Entropic scar
    if (system.anomalies.includes("ENTROPIC_SCAR")) {
      modifiers.push({
        label: "Entropic Scar",
        value: cfg.entropicScarValue,
      });
      systemModifiersValue += cfg.entropicScarValue;
    }

    // Per-planet modifiers
    for (const planet of system.planets) {
      // Tech skips - accumulate for single line
      if (planet.tech && planet.tech.length > 0) {
        const techValue = planet.tech.length * cfg.techValue;
        techSkipCount += planet.tech.length;
        techSkipValue += techValue;
        systemModifiersValue += techValue;
      }

      // Legendary planets
      if (planet.legendary) {
        let legendaryValue = cfg.otherLegendaryValue;
        let legendaryLabel = planet.name;

        if (planet.name === "Hope's End") {
          legendaryValue = cfg.hopesEndValue;
        } else if (planet.name === "Emelpar") {
          legendaryValue = cfg.emelparValue;
        } else if (planet.name === "Industrex") {
          legendaryValue = cfg.industrexValue;
        }

        modifiers.push({
          label: legendaryLabel,
          value: legendaryValue,
        });
        systemModifiersValue += legendaryValue;
      }

      // Trade stations
      if (planet.tradeStation) {
        modifiers.push({
          label: "Trade Station",
          value: cfg.tradeStationValue,
        });
        systemModifiersValue += cfg.tradeStationValue;
      }
    }

    // Path-to-Mecatol anomaly penalties
    if (cfg.mecatolPathIndices.includes(i)) {
      if (system.anomalies.includes("SUPERNOVA")) {
        modifiers.push({
          label: "Supernova on Path",
          value: cfg.supernovaOnPathPenalty,
        });
        systemModifiersValue += cfg.supernovaOnPathPenalty;
      }
      if (system.anomalies.includes("NEBULA")) {
        modifiers.push({
          label: "Nebula on Path",
          value: cfg.nebulaOnPathPenalty,
        });
        systemModifiersValue += cfg.nebulaOnPathPenalty;
      }
    }

    // Calculate equidistant penalty on the FULL system value (optimal + modifiers)
    if (isEquidistant) {
      const fullSystemValue = sysResources + sysInfluence + sysFlex + systemModifiersValue;
      equidistantPenalty += fullSystemValue * (1 - cfg.equidistantMultiplier);
    }
  }

  // Add tech skips as single entry if any
  if (techSkipCount > 0) {
    modifiers.unshift({
      label: "Tech Skips",
      value: techSkipValue,
      count: techSkipCount,
    });
  }

  const optimalSum = optimalResources + optimalInfluence + optimalFlex;
  const modifiersSum = modifiers.reduce((acc, m) => acc + m.value, 0);
  const total = optimalSum + modifiersSum - equidistantPenalty;

  return {
    total,
    optimal: {
      resources: optimalResources,
      influence: optimalInfluence,
      flex: optimalFlex,
      sum: optimalSum,
    },
    equidistantPenalty: equidistantPenalty > 0 ? equidistantPenalty : null,
    equidistantMultiplier: cfg.equidistantMultiplier,
    modifiers,
  };
}

export function useSliceValueBreakdown(slice: Slice): SliceValueBreakdown;
export function useSliceValueBreakdown(slice: Slice | undefined): SliceValueBreakdown | undefined;
export function useSliceValueBreakdown(slice: Slice | undefined): SliceValueBreakdown | undefined {
  const config = useSliceValueConfig();
  if (!slice) return undefined;
  const systems = systemsInSlice(slice);
  return calculateBreakdown(systems, config);
}
