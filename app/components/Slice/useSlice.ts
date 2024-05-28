import { useMemo } from "react";
import {
  MapConfig,
  optimalStatsForSystems,
  parseMapString,
  systemsInSlice,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";

export function useSlice(config: MapConfig, slice: string[]) {
  const tiles = useMemo(
    () => parseMapString(config, slice, config.seatTilePlacement, false),
    [slice],
  );
  const systems = systemsInSlice(slice);
  const total = totalStatsForSystems(systems);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  return { tiles, total, optimal, specialties };
}
