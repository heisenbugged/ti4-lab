import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { MapTile } from "../MapTile";
import { TileRef } from "~/types";
import { MapContext } from "~/contexts/MapContext";

type Props = {
  id: string;
  tiles: TileRef[];
  sliceHeight: number;
  sliceConcentricCircles?: number;
  wOffsetMultiplier?: number;
  mapModifiable?: boolean;
  onSelectTile?: (tile: TileRef) => void;
  onDeleteTile?: (tile: TileRef) => void;
};

export function SliceMap({
  id,
  tiles,
  sliceHeight,
  sliceConcentricCircles = 1,
  wOffsetMultiplier = 0,
  mapModifiable = false,
  onSelectTile,
  onDeleteTile,
}: Props) {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const gap = 6;
  const radius = calculateMaxHexWidthRadius(sliceConcentricCircles, width, gap);
  const height = calcHexHeight(radius) * sliceHeight + gap;
  return (
    <MapContext.Provider
      value={{
        width,
        height,
        radius,
        gap,
        hOffset: height - calcHexHeight(radius) - 10, //padding
        wOffset: width * 0.5 - radius + radius * wOffsetMultiplier,
        disabled: false,
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height,
          zIndex: 10,
        }}
      >
        {radius > 0 &&
          tiles.map((t, idx) => (
            <MapTile
              mapId={id}
              key={idx}
              tile={t}
              onSelect={onSelectTile ? () => onSelectTile(t) : undefined}
              onDelete={onDeleteTile ? () => onDeleteTile(t) : undefined}
              modifiable={mapModifiable}
            />
          ))}
      </div>
    </MapContext.Provider>
  );
}
