import { OpenTile, PlayerDemoTile as TPlayerDemoTile } from "~/types";
import { calculateMaxHexRadius } from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { MapConfig } from "~/utils/map";
import { useContext } from "react";
import { getHexPosition } from "~/utils/positioning";
import { MapContext } from "~/contexts/MapContext";
import { PlayerDemoTile } from "./tiles/PlayerDemoTile";
import { EmptyTile } from "./tiles/EmptyTile";

type Props = {
  id: string;
  map: (TPlayerDemoTile | OpenTile)[];
  padding: number;
  titles: string[];
  colors: string[];
};

export function DemoMap({ id, map, padding, titles, colors }: Props) {
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
            <DemoMapTile
              key={idx}
              mapId={id}
              tile={tile}
              titles={titles}
              colors={colors}
            />
          ))}
      </Box>
    </MapContext.Provider>
  );
}

type DemoMapTileProps = {
  mapId: string;
  tile: TPlayerDemoTile | OpenTile;
  titles: string[];
  colors: string[];
};

export function DemoMapTile({
  mapId,
  tile,
  tile: { position },
  titles,
  colors,
}: DemoMapTileProps) {
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: JSX.Element;
  if (tile.type === "PLAYER_DEMO") {
    Tile = (
      <PlayerDemoTile
        tile={tile}
        title={titles[tile.playerNumber]}
        color={colors[tile.playerNumber]}
      />
    );

    // title={tile./>;
  } else {
    Tile = <EmptyTile mapId={mapId} tile={tile} modifiable={false} />;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x + wOffset,
        top: y + hOffset,
      }}
    >
      {Tile}
    </div>
  );
}
