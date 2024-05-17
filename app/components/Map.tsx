import { Map as MapType } from "~/types";
import { MapContext } from "./MapContext";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";

type Props = {
  map: MapType;
  padding: number;
};

export function Map({ map, padding }: Props) {
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
        {map.tiles.map((tile) => (
          <MapTile
            key={`${tile.position.x}-${tile.position.y}-${tile.position.z}`}
            tile={tile}
          />
        ))}
      </Box>
    </MapContext.Provider>
  );
}
