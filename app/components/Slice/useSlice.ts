import { Slice } from "~/types";
import {
  optimalStatsForSystems,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";
import { systemsInSlice } from "~/utils/slice";
import { useDraft } from "~/draftStore";

export function useSlice(slice: Slice) {
  const entropicScarValue = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.entropicScarValue,
  );
  const systems = systemsInSlice(slice);
  const total = totalStatsForSystems(systems);
  const optimal = optimalStatsForSystems(systems, entropicScarValue);
  const specialties = techSpecialtiesForSystems(systems);
  return { total, optimal, specialties };
}
