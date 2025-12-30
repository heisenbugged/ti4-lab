import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useDraft } from "~/draftStore";
import { draftConfig } from "~/draft";
import {
  buildSliceValueConfig,
  calculateSliceValue,
  getEquidistantIndices,
} from "~/stats";

/**
 * Hook to get the slice value config from draft settings.
 * Useful when you need to calculate slice values for multiple slices.
 */
export function useSliceValueConfig() {
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const draftType = useDraft((state) => state.draft.settings.type);
  const config = draftConfig[draftType];
  return buildSliceValueConfig(
    sliceValueModifiers,
    getEquidistantIndices(draftType),
    config?.mecatolPathSystemIndices,
  );
}

/**
 * Hook to calculate the slice value for a given slice.
 * Automatically pulls sliceValueModifiers from draft settings
 * and determines equidistant indices based on draft type.
 */
export function useSliceValue(slice: Slice): number;
export function useSliceValue(slice: Slice | undefined): number | undefined;
export function useSliceValue(slice: Slice | undefined): number | undefined {
  const config = useSliceValueConfig();
  if (!slice) return undefined;
  const systems = systemsInSlice(slice);
  return calculateSliceValue(systems, config);
}

