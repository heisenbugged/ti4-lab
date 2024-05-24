import { useMemo } from "react";
import {
  optimalStatsForSystems,
  parseMapString,
  systemsInSlice,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";

const slicePositionOrder = [
  { x: 0, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  // additional two slices for full milty draft
  // { x: -1, y: -1, z: 0 },
  // { x: 0, y: -2, z: 0 },
];

export function useSlice(slice: string[]) {
  const tiles = useMemo(
    () => parseMapString(slice, slicePositionOrder, false),
    [slice],
  );
  const systems = systemsInSlice(slice);
  const total = totalStatsForSystems(systems);
  const optimal = optimalStatsForSystems(systems);
  const specialties = techSpecialtiesForSystems(systems);
  return { tiles, total, optimal, specialties };
}
