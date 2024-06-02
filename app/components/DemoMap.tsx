import {
  EmptyTile,
  OpenTile,
  PlayerDemoTile as TPlayerDemoTile,
} from "~/types";
import {
  calcHexHeight,
  calculateMaxHexWidthRadius,
  getHexPosition,
} from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { PlayerDemoTile } from "./tiles/PlayerDemoTile";
import { Hex } from "./Hex";

import classes from "./tiles/Tiles.module.css";

type Props = {
  id: string;
  map: (TPlayerDemoTile | OpenTile | EmptyTile)[];
  padding: number;
  titles: string[];
  colors: string[];
};

export function DemoMap({ id, map, padding, titles, colors }: Props) {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const n = 3;
  const gap = 6;
  const radius = calculateMaxHexWidthRadius(n, width, gap);
  const height = calcHexHeight(radius) * 7 + 6 * gap;

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
      <Box ref={ref} w="100%" h={height}>
        {width > 0 &&
          map
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
  tile: TPlayerDemoTile | OpenTile | EmptyTile;
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
  } else {
    Tile = (
      <Hex
        id={`${mapId}-empty`}
        radius={radius}
        colorClass={tile.type === "OPEN" ? classes.system : classes.demoEmpty}
        borderColorClass={classes.demoBorder}
        showBorder={tile.type !== "OPEN"}
        borderRadius={4}
      />
    );
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
