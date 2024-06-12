import { HomeTile, Map as MapType, MapV2 } from "~/types";
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
  padding: number;
  mode: "create" | "draft";
  disabled?: boolean;
  onSelectSystemTile?: (tileIdx: number) => void;
  onDeleteSystemTile?: (tileIdx: number) => void;
  onSelectHomeTile?: (tile: HomeTile) => void;
};

export function Map({
  id,
  config,
  map,
  padding,
  mode,
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
        hOffset: -radius + height * 0.5 + padding,
        wOffset: -radius + width * 0.5 + padding,
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
                  onSelectSystemTile?.(idx);
                if (tile.type === "HOME") onSelectHomeTile?.(tile);
              }}
              onDelete={() => {
                if (tile.type === "SYSTEM") onDeleteSystemTile?.(idx);
              }}
              modifiable={mode === "create" && isTileModifiable(config, idx)}
              homeSelectable={onSelectHomeTile && mode === "draft"}
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
  map: MapType;
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
