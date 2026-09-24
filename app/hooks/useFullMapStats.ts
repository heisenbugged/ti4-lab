import { useMemo } from "react";
import { useDraft } from "~/draftStore";
import { slicesToSystemIds } from "~/utils/slice";
import { calculateMapStats } from "~/utils/mapStats";

export { calculateMapStats };

export function useFullMapStats() {
  const slices = useDraft((state) => state.draft.slices);
  const presetMap = useDraft((state) => state.draft.presetMap);

  return useMemo(
    () => calculateMapStats(slicesToSystemIds(slices), presetMap),
    [slices, presetMap],
  );
}
