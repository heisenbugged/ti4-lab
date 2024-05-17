import { calcHexHeight, calculateMaxHexRadius } from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { MapTile } from "./MapTile";
import { MapContext } from "./MapContext";
import { parseMapString } from "~/utils/map";

const slicePositionOrder = [
  { x: 0, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  // additional two slices for full milty draft
  // { x: -1, y: -1, z: 0 },
  // { x: 0, y: -2, z: 0 },
];

export function Slice({ mapString }: { mapString: string }) {
  const { tiles } = parseMapString(mapString, slicePositionOrder);
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const gap = Math.min(width, height) * 0.03;
  const radius = calculateMaxHexRadius(1, width, height, gap);

  return (
    <MapContext.Provider
      value={{
        width,
        height,
        radius,
        gap,
        hOffset: height - calcHexHeight(radius) - gap, // + gap for 2 row offset
        wOffset: width * 0.5 - radius,
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {tiles.map((t, idx) => (
          <MapTile key={idx} tile={t} />
        ))}
      </div>
    </MapContext.Provider>
  );
}
