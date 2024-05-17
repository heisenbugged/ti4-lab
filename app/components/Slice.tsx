import {
  calcHexHeight,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
} from "~/utils/positioning";
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
  const { ref, width } = useDimensions<HTMLDivElement>();
  const gap = 6;
  const radius = calculateMaxHexWidthRadius(1, width, gap);
  const height = calcHexHeight(radius) * 2 + gap;

  return (
    <MapContext.Provider
      value={{
        width,
        height,
        radius,
        gap,
        hOffset: calcHexHeight(radius) + gap, // + gap for 2 row offset
        wOffset: width * 0.5 - radius,
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height,
        }}
      >
        {tiles.map((t, idx) => (
          <MapTile key={idx} tile={t} />
        ))}
      </div>
    </MapContext.Provider>
  );
}
