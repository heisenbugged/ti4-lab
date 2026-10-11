import { useMemo } from "react";
import { useDraft } from "~/draftStore";
import { Slice, SystemId, Tile } from "~/types";
import { systemIdsInSlice } from "~/utils/slice";

export function getUsedSystemIdsInMap(presetMap: Tile[]): SystemId[] {
  return presetMap
    .map((t) => (t.type === "SYSTEM" ? t.systemId : undefined))
    .filter((t) => t !== undefined) as SystemId[];
}

export function getUsedSystemIds(
  slices: Slice[],
  presetMap: Tile[],
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
