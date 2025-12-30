import { useMemo } from "react";
import {
  buildSliceValueConfig,
  calculateSliceValue,
  getEquidistantIndices,
} from "~/stats";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useDraft } from "~/draftStore";

export function useSortedSlices(slices: Slice[], draftedSlices: number[]) {
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const draftType = useDraft((state) => state.draft.settings.type);

  const sortedSlices = useMemo(() => {
    const config = buildSliceValueConfig(
      sliceValueModifiers,
      getEquidistantIndices(draftType),
    );
    return slices
      .map((slice, idx) => ({ slice, idx }))
      .sort((a, b) => {
        if (draftedSlices.includes(a.idx)) return 1;
        if (draftedSlices.includes(b.idx)) return -1;
        const aSystems = systemsInSlice(a.slice);
        const bSystems = systemsInSlice(b.slice);
        return (
          calculateSliceValue(bSystems, config) -
          calculateSliceValue(aSystems, config)
        );
      });
  }, [slices, draftedSlices, sliceValueModifiers, draftType]);

  return sortedSlices;
}
