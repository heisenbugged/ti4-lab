import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { MapTile } from "../MapTile";
import { Tile } from "~/types";
import { MapContext } from "~/contexts/MapContext";

type Props = {
  id: string;
  tiles: Tile[];
  mode: "create" | "draft";
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
};

export function SliceMap({
  id,
  tiles,
  mode = "create",
  onSelectTile,
  onDeleteTile,
}: Props) {
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
        hOffset: calcHexHeight(radius), // + gap for 2 row offset
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
        {radius > 0 &&
          tiles.map((t, idx) => (
            <MapTile
              mapId={id}
              key={idx}
              tile={t}
              onSelect={onSelectTile ? () => onSelectTile(t) : undefined}
              onDelete={onDeleteTile ? () => onDeleteTile(t) : undefined}
              modifiable={mode === "create"}
            />
          ))}
      </div>
    </MapContext.Provider>
  );
}
