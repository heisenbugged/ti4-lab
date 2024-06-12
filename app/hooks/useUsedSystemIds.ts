import { useMemo } from "react";
import { useDraftV2 } from "~/draftStore";
import { systemsInSlice } from "~/utils/slice";

export function useUsedSystemIds() {
  const slices = useDraftV2((state) => state.draft.slices);
  const map = useDraftV2((state) => state.draft.presetMap);

  const used = useMemo(() => {
    const sliceSystemIds = slices.map((s) => systemsInSlice(s));
    const mapSystemIds = map
      .map((t) => (t.type === "SYSTEM" ? t.systemId : undefined))
      .filter((t) => t !== undefined) as string[];

    return [sliceSystemIds, mapSystemIds].flat(2);
  }, [slices, map]);

  return used;
}
