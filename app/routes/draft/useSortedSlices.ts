import { useMemo } from "react";
import { valueSlice } from "~/stats";
import { systemsInSlice } from "~/utils/map";

export function useSortedSlices(slices: string[][], draftedSlices: number[]) {
  const sortedSlices = useMemo(() => {
    return slices
      .map((slice, idx) => ({ slice, idx }))
      .sort((a, b) => {
        if (draftedSlices.includes(a.idx)) return 1;
        if (draftedSlices.includes(b.idx)) return -1;
        const aSystems = systemsInSlice(a.slice);
        const bSystems = systemsInSlice(b.slice);
        return valueSlice(bSystems) - valueSlice(aSystems);
      });
  }, [slices, draftedSlices]);

  return sortedSlices;
}
