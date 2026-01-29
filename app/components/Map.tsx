import type { HomeTile, Map as TiMap, Tile } from "~/types";
import {
  calculateConcentricCircles,
  calculateMaxHexRadius,
} from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { EquidistantLines } from "./EquidistantLines";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { MapContext } from "~/contexts/MapContext";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import type { SliceValueBreakdown } from "~/hooks/useSliceValueBreakdown";
import type { TileContribution, SliceStats } from "~/mapgen/utils/sliceScoring";

type Props = {
  id: string;
  modifiableMapTiles: number[];
  ringHighlightTiles?: number[];
  map: TiMap;
  interactions: MapInteractions;
  disabled?: boolean;
  onSelectSystemTile?: (tile: Tile) => void;
  onDeleteSystemTile?: (tile: Tile) => void;
  onSelectHomeTile?: (tile: HomeTile) => void;
  sliceValues?: Record<number, number>;
  sliceStats?: Record<number, SliceStats>;
  sliceBreakdowns?: Record<number, SliceValueBreakdown>; // Indexed by tile idx
  coreSliceData?: CoreSliceData[]; // Indexed by seat number
  tileContributions?: Record<number, Map<number, TileContribution>>; // homeIdx -> tileIdx -> contribution
  hoveredHomeIdx?: number | null;
  onHomeHover?: (idx: number | null) => void;
  closeTileMode?: boolean;
  closedTiles?: number[];
  onToggleTileClosed?: (idx: number) => void;
};

export type MapInteractions = {
  editable: boolean;
  droppable: boolean;
  hoverEffects: boolean;
  allowSystemSelect: boolean;
  allowOpenSelect: boolean;
  allowHomeSelect: boolean;
  allowSystemDelete: boolean;
};

export const MAP_INTERACTIONS: Record<string, MapInteractions> = {
  readonly: {
    editable: false,
    droppable: false,
    hoverEffects: false,
    allowSystemSelect: false,
    allowOpenSelect: false,
    allowHomeSelect: false,
    allowSystemDelete: false,
  },
  draftBuild: {
    editable: true,
    droppable: false,
    hoverEffects: true,
    allowSystemSelect: true,
    allowOpenSelect: true,
    allowHomeSelect: false,
    allowSystemDelete: true,
  },
  mapGenerator: {
    editable: true,
    droppable: false,
    hoverEffects: true,
    allowSystemSelect: true,
    allowOpenSelect: true,
    allowHomeSelect: false,
    allowSystemDelete: true,
  },
  texasBuild: {
    editable: false,
    droppable: true,
    hoverEffects: false,
    allowSystemSelect: false,
    allowOpenSelect: true,
    allowHomeSelect: false,
    allowSystemDelete: false,
  },
  rawDraft: {
    editable: false,
    droppable: true,
    hoverEffects: true,
    allowSystemSelect: false,
    allowOpenSelect: false,
    allowHomeSelect: false,
    allowSystemDelete: false,
  },
};

export function Map({
  id,
  modifiableMapTiles,
  ringHighlightTiles = [],
  map,
  interactions,
  disabled = false,
  onSelectSystemTile,
  onDeleteSystemTile,
  onSelectHomeTile,
  sliceValues = {},
  sliceStats = {},
  sliceBreakdowns = {},
  coreSliceData,
  tileContributions,
  hoveredHomeIdx,
  onHomeHover,
  closeTileMode = false,
  closedTiles = [],
  onToggleTileClosed,
}: Props) {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const n = calculateConcentricCircles(map.length);
  const gap = Math.min(width, height) * 0.01;
  const radius = calculateMaxHexRadius(n, width, height, gap);

  return (
    <MapContext.Provider
      value={{
        width,
        height,
        radius,
        gap,
        hOffset: -radius + height * 0.5,
        wOffset: -radius + width * 0.5,
        disabled,
      }}
    >
      <Box ref={ref} w="100%" h="100%" style={{ position: "relative" }}>
        {map
          .filter((t) => !!t.position)
          .map((tile) => {
            const isTileModifiable = modifiableMapTiles.includes(tile.idx);
            const canModifyTile =
              isTileModifiable && (interactions.editable || interactions.droppable);
            const canSelectSystem =
              interactions.allowSystemSelect &&
              tile.type === "SYSTEM" &&
              canModifyTile &&
              !!onSelectSystemTile;
            const canSelectOpen =
              interactions.allowOpenSelect &&
              tile.type === "OPEN" &&
              canModifyTile &&
              !!onSelectSystemTile;
            const canSelectHome =
              interactions.allowHomeSelect &&
              tile.type === "HOME" &&
              !!onSelectHomeTile;
            const shouldProvideSelect =
              (closeTileMode && !!onToggleTileClosed) ||
              canSelectSystem ||
              canSelectOpen ||
              canSelectHome;

            return (
              <MapTile
                mapId={id}
                key={`${tile.position.x}-${tile.position.y}`}
                tile={tile}
                onSelect={
                  shouldProvideSelect
                    ? () => {
                        if (closeTileMode && onToggleTileClosed) {
                          onToggleTileClosed(tile.idx);
                        } else {
                        if (tile.type === "SYSTEM") onSelectSystemTile?.(tile);
                        if (tile.type === "OPEN" && canModifyTile)
                          onSelectSystemTile?.(tile);
                        if (tile.type === "HOME") onSelectHomeTile?.(tile);
                        }
                      }
                    : undefined
                }
                onDelete={() => {
                  if (
                    tile.type === "SYSTEM" &&
                    interactions.allowSystemDelete &&
                    isTileModifiable
                  ) {
                    onDeleteSystemTile?.(tile);
                  }
                }}
                modifiable={interactions.editable && isTileModifiable}
                droppable={interactions.droppable && isTileModifiable}
                ringHighlight={ringHighlightTiles.includes(tile.idx)}
                homeSelectable={interactions.allowHomeSelect && !!onSelectHomeTile}
                hoverEffects={interactions.hoverEffects}
                sliceValue={sliceValues[tile.idx]}
                sliceStats={sliceStats[tile.idx]}
                sliceBreakdown={sliceBreakdowns[tile.idx]}
                coreSliceData={
                  tile.type === "HOME" && tile.seat !== undefined && coreSliceData
                    ? coreSliceData[tile.seat]
                    : undefined
                }
                tileContribution={
                  hoveredHomeIdx !== null && hoveredHomeIdx !== undefined && tileContributions
                    ? tileContributions[hoveredHomeIdx]?.get(tile.idx)
                    : undefined
                }
                isHomeHovered={tile.type === "HOME" && tile.idx === hoveredHomeIdx}
                hoveredHomeIdx={hoveredHomeIdx}
                onHomeHover={tile.type === "HOME" ? onHomeHover : undefined}
                closeTileMode={closeTileMode}
                isClosed={closedTiles.includes(tile.idx)}
              />
            );
          })}
        <EquidistantLines
          map={map}
          hoveredHomeIdx={hoveredHomeIdx ?? null}
          tileContributions={tileContributions}
        />
      </Box>
    </MapContext.Provider>
  );
}

export function RawMap({
  mapId,
  map,
  width,
  height,
}: {
  mapId: string;
  map: TiMap;
  width: number;
  height: number;
}) {
  const n = calculateConcentricCircles(map.length);
  const gap = Math.min(width, height) * 0.01;
  const radius = calculateMaxHexRadius(n, width, height, gap);

  return (
    <MapContext.Provider
      value={{
        width,
        height,
        radius,
        gap,
        hOffset: -radius + height * 0.5,
        wOffset: -radius + width * 0.5,
        disabled: false,
      }}
    >
      <Box w="100%" h="100%">
        {map
          .filter((t) => !!t.position)
          .map((tile) => (
            <MapTile
              mapId={mapId}
              key={`${tile.position.x}-${tile.position.y}`}
              tile={tile}
            />
          ))}
      </Box>
    </MapContext.Provider>
  );
}
