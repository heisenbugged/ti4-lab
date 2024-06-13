import { HomeTileRef, Map as MapType, MapV2, TileRef } from "~/types";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { isTileModifiable } from "~/utils/map";
import { MapContext } from "~/contexts/MapContext";
import { DraftConfig } from "~/draft";

type Props = {
  id: string;
  config: DraftConfig;
  map: MapV2;
  editable: boolean;
  disabled?: boolean;
  onSelectSystemTile?: (tile: TileRef) => void;
  onDeleteSystemTile?: (tile: TileRef) => void;
  onSelectHomeTile?: (tile: HomeTileRef) => void;
};

export function Map({
  id,
  config,
  map,
  editable = false,
  disabled = false,
  onSelectSystemTile,
  onDeleteSystemTile,
  onSelectHomeTile,
}: Props) {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const n = 3;
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
      <Box ref={ref} w="100%" h="100%">
        {map
          .filter((t) => !!t.position)
          .map((tile, idx) => (
            <MapTile
              mapId={id}
              key={`${tile.position.x}-${tile.position.y}`}
              tile={tile}
              onSelect={() => {
                if (tile.type === "SYSTEM" || tile.type === "OPEN")
                  onSelectSystemTile?.(tile);
                if (tile.type === "HOME") onSelectHomeTile?.(tile);
              }}
              onDelete={() => {
                if (tile.type === "SYSTEM") onDeleteSystemTile?.(tile);
              }}
              modifiable={editable && isTileModifiable(config, idx)}
              homeSelectable={!!onSelectHomeTile}
            />
          ))}
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
  map: MapV2;
  width: number;
  height: number;
}) {
  const n = 3;
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
