import { Slice } from "~/types";
import { optimalStatsForSystems, techSpecialtiesForSystems } from "~/utils/map";
import { systemsInSlice } from "~/utils/slice";
import { useDraft } from "~/draftStore";
import { calculateSliceValue } from "~/stats";

export function useSlice(slice: Slice) {
  const entropicScarValue = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.entropicScarValue,
  );
  const systems = systemsInSlice(slice);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  const sliceValue = calculateSliceValue(systems, entropicScarValue);
  return { optimal, specialties, sliceValue };
}
