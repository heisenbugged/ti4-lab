import { useMemo } from "react";
import {
  optimalStats,
  parseMapString,
  techSpecialties,
  totalStats,
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

export function useSlice(systems: string[]) {
  const tiles = useMemo(
    () => parseMapString(systems, slicePositionOrder, false),
    [systems],
  );
  const total = totalStats(tiles);
  const optimal = optimalStats(tiles);
  const specialties = techSpecialties(tiles);
  return { tiles, total, optimal, specialties };
}
