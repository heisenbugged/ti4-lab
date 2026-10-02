import { useMemo } from "react";
import { Map, System } from "~/types";
import { systemData } from "~/data/systemData";
import { CORE_SLICES } from "~/draft/heisen/generateMap";
import {
  calculateBreakdown,
  compactSliceSlots,
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
      const { systems, config } = compactSliceSlots(
        positions.map((pos) => {
          const tile = map[pos];
          return tile?.type === "SYSTEM"
            ? systemData[tile.systemId]
            : undefined;
        }),
        { ...sliceValueModifiers, ...CORE_SLICE_VALUE_CONFIG },
      );
      const breakdown = calculateBreakdown(systems, config);

      return { value: breakdown.total, systems, breakdown };
    });
  }, [map, sliceValueModifiers]);
}
