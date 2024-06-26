import { Slice } from "~/types";
import {
  optimalStatsForSystems,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";
import { systemsInSlice } from "~/utils/slice";

export function useSlice(slice: Slice) {
  const systems = systemsInSlice(slice);
  const total = totalStatsForSystems(systems);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  return { total, optimal, specialties };
}
