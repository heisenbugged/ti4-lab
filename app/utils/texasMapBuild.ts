import { systemData } from "~/data/systemData";
import { getRingForIndex } from "~/utils/hexCoordinates";
import {
  buildHexGraph,
  getPositionsWithinDistance,
} from "~/utils/hexDistance";
import { Map, SystemId } from "~/types";

export function getCurrentPlaceableRing(map: Map): number {
  const maxRing = Math.max(...map.map((tile) => getRingForIndex(tile.idx)));
  for (let ring = 1; ring <= maxRing; ring++) {
    const hasOpen = map.some(
      (tile) => tile.type === "OPEN" && getRingForIndex(tile.idx) === ring,
    );
    if (hasOpen) return ring;
  }
  return maxRing;
}

export function getPlaceableTileIndices(
  map: Map,
  playerTiles: SystemId[],
  draggedSystemId?: SystemId,
): number[] {
  const ring = getCurrentPlaceableRing(map);
  const baseIndices = map
    .filter(
      (tile) => tile.type === "OPEN" && getRingForIndex(tile.idx) === ring,
    )
    .map((tile) => tile.idx);

  if (!draggedSystemId) return baseIndices;

  const draggedSystem = systemData[draggedSystemId];
  if (!draggedSystem) return baseIndices;

  // Build hex graph with OPEN tiles included for adjacency checking
  // This is necessary because OPEN tiles need edges to detect hyperlane-connected anomalies
  const graph = buildHexGraph(map, { includeOpenTiles: true });

  let filtered = baseIndices;

  if (draggedSystem.anomalies.length > 0) {
    const hasNonAnomalyOption = playerTiles.some(
      (tileId) => systemData[tileId]?.anomalies.length === 0,
    );

    if (hasNonAnomalyOption) {
      filtered = filtered.filter((idx) => {
        // Get all positions within distance 1 (includes hyperlane shortcuts)
        const reachablePositions = getPositionsWithinDistance(graph, idx, 1);
        // Check if any adjacent position (excluding self) has an anomaly
        for (const [adjIdx] of reachablePositions) {
          if (adjIdx === idx) continue;
          const adjTile = map[adjIdx];
          if (
            adjTile &&
            adjTile.type === "SYSTEM" &&
            systemData[adjTile.systemId]?.anomalies.length > 0
          ) {
            return false;
          }
        }
        return true;
      });
    }
  }

  if (draggedSystem.wormholes.length > 0) {
    draggedSystem.wormholes.forEach((wormholeType) => {
      const hasAlternative = playerTiles.some((tileId) => {
        const system = systemData[tileId];
        return !system.wormholes.includes(wormholeType);
      });

      if (hasAlternative) {
        filtered = filtered.filter((idx) => {
          // Get all positions within distance 1 (includes hyperlane shortcuts)
          const reachablePositions = getPositionsWithinDistance(graph, idx, 1);
          // Check if any adjacent position (excluding self) has the same wormhole
          for (const [adjIdx] of reachablePositions) {
            if (adjIdx === idx) continue;
            const adjTile = map[adjIdx];
            if (
              adjTile &&
              adjTile.type === "SYSTEM" &&
              systemData[adjTile.systemId]?.wormholes.includes(wormholeType)
            ) {
              return false;
            }
          }
          return true;
        });
      }
    });
  }

  return filtered;
}
