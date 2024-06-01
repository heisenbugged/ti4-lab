import { useMemo } from "react";
import { DraftConfig } from "~/draft";
import {
  optimalStatsForSystems,
  parseMapString,
  systemsInSlice,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";

export function useSlice(config: DraftConfig, slice: string[]) {
  const tiles = useMemo(
    () => parseMapString(config, slice, config.seatTilePositions, false),
    [slice],
  );
  const systems = systemsInSlice(slice);
  const total = totalStatsForSystems(systems);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  return { tiles, total, optimal, specialties };
}
