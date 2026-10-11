import { systemData } from "~/data/systemData";
import { getRingForIndex } from "~/utils/hexCoordinates";
import { buildHexGraph } from "~/utils/hexDistance";
import {
  AdjacencyRules,
  buildAdjacencyMap,
  isPlacementLegal,
} from "~/mapgen/utils/mapLegality";
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

  const hasNonAnomalyOption = playerTiles.some(
    (tileId) => systemData[tileId]?.anomalies.length === 0,
  );
  // Only enforce a rule when the player could place something else instead.
  const rules: AdjacencyRules = {
    anomalies: hasNonAnomalyOption,
    wormholes: draggedSystem.wormholes.filter((wormholeType) =>
      playerTiles.some(
        (tileId) => !systemData[tileId]?.wormholes.includes(wormholeType),
      ),
    ),
  };

  // OPEN tiles need graph edges to detect hyperlane-connected neighbors.
  const adjacencyMap = buildAdjacencyMap(
    map,
    buildHexGraph(map, { includeOpenTiles: true }),
  );

  return baseIndices.filter((idx) =>
    isPlacementLegal(map, idx, draggedSystemId, adjacencyMap, rules),
  );
}
