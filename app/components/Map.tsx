import { HomeTile, Map as MapType } from "~/types";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { isTileModifiable } from "~/utils/map";
import { MapContext } from "~/contexts/MapContext";

type Props = {
  id: string;
  map: MapType;
  padding: number;
  mode: "create" | "draft";
  onSelectSystemTile?: (tileIdx: number) => void;
  onSelectHomeTile?: (tile: HomeTile) => void;
};

export function Map({
  id,
  map,
  padding,
  mode,
  onSelectSystemTile,
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
              modifiable={mode === "create" && isTileModifiable(idx)}
              homeSelectable={onSelectHomeTile && mode === "draft"}
            />
          ))}
      </Box>
    </MapContext.Provider>
  );
}
