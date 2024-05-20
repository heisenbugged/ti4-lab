import { Map as MapType, System } from "~/types";
import { MapContext } from "./MapContext";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";

type Props = {
  id: string;
  map: MapType;
  padding: number;
  onSelectSystem?: (tileIdx: number, system: System) => void;
};

export function Map({ id, map, padding, onSelectSystem }: Props) {
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
        {map.tiles.map((tile, idx) => (
          <MapTile
            mapId={id}
            key={`${tile.position.x}-${tile.position.y}-${tile.position.z}`}
            tile={tile}
            onSelectSystem={(system) => {
              if (onSelectSystem) onSelectSystem(idx, system);
            }}
          />
        ))}
      </Box>
    </MapContext.Provider>
  );
}
