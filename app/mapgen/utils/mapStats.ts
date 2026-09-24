import { useMemo } from "react";
import { useMapBuilder } from "~/mapBuilderStore";
import { calculateMapStats } from "~/utils/mapStats";

export function useMapStats() {
  const map = useMapBuilder((state) => state.state.map);

  return useMemo(() => calculateMapStats([], map), [map]);
}
