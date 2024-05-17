import { Map as MapType } from "~/types";
import { MapContext } from "./MapContext";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { MapTile } from "./MapTile";
import { useDimensions } from "~/hooks/useDimensions";

type Props = {
  map: MapType;
};

export function Map({ map }: Props) {
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
      }}
    >
      <div
        ref={ref}
        style={{
          width: "95vw",
          height: "95vh",
          position: "relative",
          // for debugging
          // backgroundColor: "lightgray",
        }}
      >
        {map.tiles.map((tile) => (
          <MapTile
            key={`${tile.position.x}-${tile.position.y}-${tile.position.z}`}
            tile={tile}
          />
        ))}
      </div>
    </MapContext.Provider>
  );
}
