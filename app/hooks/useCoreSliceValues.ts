import { useMemo } from "react";
import { Map, System } from "~/types";
import { systemData } from "~/data/systemData";
import { CORE_SLICES } from "~/draft/heisen/generateMap";
import {
  calculateBreakdown,
  calculateSliceValue,
  CORE_SLICE_VALUE_CONFIG,
  SliceValueBreakdown,
  SliceValueModifiers,
} from "~/stats";

export type CoreSliceData = {
  value: number;
  systems: System[];
  breakdown: SliceValueBreakdown;
};

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

      const config = { ...sliceValueModifiers, ...CORE_SLICE_VALUE_CONFIG };

      return {
        value: calculateSliceValue(systems, config),
        systems,
        breakdown: calculateBreakdown(systems, config),
      };
    });
  }, [map, sliceValueModifiers]);
}
