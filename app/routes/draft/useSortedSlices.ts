import { useMemo } from "react";
import { calculateSliceValue, draftSliceValueConfig } from "~/stats";
import { draftConfig } from "~/draft/draftConfig";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useDraft } from "~/draftStore";

const none: number[] = [];

/** Slices by slice value, best first; drafted slices go last. */
export function useSortedSlices(slices: Slice[], draftedSlices = none) {
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const draftType = useDraft((state) => state.draft.settings.type);

  const sortedSlices = useMemo(() => {
    const config = draftSliceValueConfig(
      draftConfig[draftType],
      sliceValueModifiers,
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
