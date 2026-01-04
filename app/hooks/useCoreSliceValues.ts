import { useMemo } from "react";
import { Map, System } from "~/types";
import { systemData } from "~/data/systemData";
import { CORE_SLICES } from "~/draft/heisen/generateMap";
import {
  calculateSliceValue,
  getSliceValueConfig,
  SliceValueModifiers,
  DEFAULT_SLICE_VALUE_MODIFIERS,
} from "~/stats";
import { SliceValueBreakdown } from "./useSliceValueBreakdown";

export type CoreSliceData = {
  value: number;
  systems: System[];
  breakdown: SliceValueBreakdown;
};

/**
 * Calculate the breakdown for a core slice (same logic as useSliceValueBreakdown but for core slices)
 */
function calculateCoreSliceBreakdown(
  systems: System[],
  sliceValueModifiers?: Partial<SliceValueModifiers>,
): SliceValueBreakdown {
  const cfg = {
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
    ...sliceValueModifiers,
    equidistantIndices: [1, 2], // Ring 2 tiles
    mecatolPathIndices: [0], // Ring 1 tile on path to Rex
  };

  let optimalResources = 0;
  let optimalInfluence = 0;
  let optimalFlex = 0;
  let equidistantPenalty = 0;

  const modifiers: { label: string; value: number; count?: number }[] = [];
  let techSkipCount = 0;
  let techSkipValue = 0;

  for (let i = 0; i < systems.length; i++) {
    const system = systems[i];
    const isEquidistant = cfg.equidistantIndices.includes(i);

    const sysResources = system.optimalSpend.resources;
    const sysInfluence = system.optimalSpend.influence;
    const sysFlex = system.optimalSpend.flex;

    optimalResources += sysResources;
    optimalInfluence += sysInfluence;
    optimalFlex += sysFlex;

    let systemModifiersValue = 0;

    if (system.anomalies.includes("ENTROPIC_SCAR")) {
      modifiers.push({
        label: "Entropic Scar",
        value: cfg.entropicScarValue,
      });
      systemModifiersValue += cfg.entropicScarValue;
    }

    for (const planet of system.planets) {
      if (planet.tech && planet.tech.length > 0) {
        const techValue = planet.tech.length * cfg.techValue;
        techSkipCount += planet.tech.length;
        techSkipValue += techValue;
        systemModifiersValue += techValue;
      }

      if (planet.legendary) {
        let legendaryValue = cfg.otherLegendaryValue;
        const legendaryLabel = planet.name;

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

      if (planet.tradeStation) {
        modifiers.push({
          label: "Trade Station",
          value: cfg.tradeStationValue,
        });
        systemModifiersValue += cfg.tradeStationValue;
      }
    }

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

    if (isEquidistant) {
      const fullSystemValue =
        sysResources + sysInfluence + sysFlex + systemModifiersValue;
      equidistantPenalty += fullSystemValue * (1 - cfg.equidistantMultiplier);
    }
  }

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

/**
 * Hook to calculate core slice values for Heisen/Nucleus drafts.
 * Returns an array of CoreSliceData, one per seat (indexed by seat number).
 */
export function useCoreSliceValues(
  map: Map,
  sliceValueModifiers?: Partial<SliceValueModifiers>,
): CoreSliceData[] {
  return useMemo(() => {
    return CORE_SLICES.map((positions) => {
      // Get systems at the core slice positions from the map
      const systems: System[] = positions
        .map((pos) => {
          const tile = map[pos];
          if (tile?.type === "SYSTEM" && "systemId" in tile) {
            return systemData[tile.systemId];
          }
          return undefined;
        })
        .filter((s): s is System => s !== undefined);

      const config = getSliceValueConfig(
        sliceValueModifiers,
        [1, 2], // equidistantIndices - ring 2 tiles
        [0], // mecatolPathIndices - ring 1 tile
      );

      const value = calculateSliceValue(systems, config);
      const breakdown = calculateCoreSliceBreakdown(
        systems,
        sliceValueModifiers,
      );

      return {
        value,
        systems,
        breakdown,
      };
    });
  }, [map, sliceValueModifiers]);
}
