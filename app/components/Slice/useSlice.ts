import { Slice } from "~/types";
import { optimalStatsForSystems, techSpecialtiesForSystems } from "~/utils/map";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";

export function useSlice(slice: Slice) {
  const systems = systemsInSlice(slice);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  const sliceValue = useSliceValue(slice);
  return { optimal, specialties, sliceValue };
}
