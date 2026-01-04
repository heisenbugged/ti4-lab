import { Map, SystemTile } from "~/types";
import { getAllSliceValues, calculateBalanceGap } from "./sliceScoring";
import { systemData } from "~/data/systemData";
import { buildHexGraph } from "~/utils/hexDistance";
import { shuffle } from "~/draft/helpers/randomization";
import { isMapLegal } from "./mapLegality";

/**
 * Attempt to improve the balance gap by swapping two systems
 * Returns the improved map if successful, null otherwise
 */
export function improveBalance(map: Map): Map | null {
  const eligibleSystemIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "SYSTEM" && tile.systemId !== "18" && idx !== 0) {
      const system = systemData[tile.systemId];
      if (system && system.type !== "HYPERLANE") {
        eligibleSystemIndices.push(idx);
      }
    }
  });

  const shuffledIndices = shuffle(eligibleSystemIndices);

  // Build graph once - valid for all swaps since we only swap non-hyperlane systems
  const graph = buildHexGraph(map);
  const currentBalanceGap = calculateBalanceGap(getAllSliceValues(map, undefined, graph));

  for (let a = 0; a < shuffledIndices.length; a++) {
    for (let b = 0; b < shuffledIndices.length; b++) {
      if (a === b) continue;

      const idxA = shuffledIndices[a];
      const idxB = shuffledIndices[b];
      const tileA = map[idxA] as SystemTile;
      const tileB = map[idxB] as SystemTile;

      if (tileA.systemId === tileB.systemId) continue;

      const newMap = map.map((tile, idx) => {
        if (idx === idxA) {
          return { ...tile, systemId: tileB.systemId } as SystemTile;
        }
        if (idx === idxB) {
          return { ...tile, systemId: tileA.systemId } as SystemTile;
        }
        return tile;
      });

      if (!isMapLegal(newMap)) continue;

      const newSliceValues = getAllSliceValues(newMap, undefined, graph);
      const newBalanceGap = calculateBalanceGap(newSliceValues);

      if (newBalanceGap < currentBalanceGap) {
        return newMap;
      }
    }
  }

  return null;
}
