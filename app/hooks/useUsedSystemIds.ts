import { useMemo } from "react";
import { useDraft } from "~/draftStore";
import { DraftSlice, SystemId, TileRef } from "~/types";
import { systemIdsInSlice } from "~/utils/slice";

export function getUsedSystemIdsInMap(presetMap: TileRef[]): SystemId[] {
  return presetMap
    .map((t) => (t.type === "SYSTEM" ? t.systemId : undefined))
    .filter((t) => t !== undefined) as SystemId[];
}

export function getUsedSystemIds(
  slices: DraftSlice[],
  presetMap: TileRef[],
): SystemId[] {
  const sliceSystemIds = slices.map((s) => systemIdsInSlice(s));
  const mapSystemIds = getUsedSystemIdsInMap(presetMap);
  return [sliceSystemIds, mapSystemIds].flat(2);
}

export function useUsedSystemIds() {
  const slices = useDraft((state) => state.draft.slices);
  const map = useDraft((state) => state.draft.presetMap);
  return useMemo(() => getUsedSystemIds(slices, map), [slices, map]);
}
