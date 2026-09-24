import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValueConfig } from "./useSliceValue";
import { calculateBreakdown, SliceValueBreakdown } from "~/stats";

export type { SliceValueBreakdown, SliceValueModifier } from "~/stats";

export function useSliceValueBreakdown(slice: Slice): SliceValueBreakdown;
export function useSliceValueBreakdown(slice: Slice | undefined): SliceValueBreakdown | undefined;
export function useSliceValueBreakdown(slice: Slice | undefined): SliceValueBreakdown | undefined {
  const config = useSliceValueConfig();
  if (!slice) return undefined;
  const systems = systemsInSlice(slice);
  return calculateBreakdown(systems, config);
}
