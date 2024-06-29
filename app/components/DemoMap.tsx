import { DemoTile, PlayerDemoTile as TPlayerDemoTile } from "~/types";
import {
  calcHexHeight,
  calculateConcentricCircles,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
  getHexPosition,
} from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { Box } from "@mantine/core";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { PlayerDemoTile } from "./tiles/PlayerDemoTile";
import { Hex } from "./Hex";
import { MecatolTile } from "./tiles/MecatolTile";

import classes from "./tiles/Tiles.module.css";
import { SystemTile } from "./tiles/SystemTile";
import { playerColors } from "~/data/factionData";

type Props = {
  id: string;
  map: DemoTile[];
  padding: number;
  titles: string[];
};

export function DemoMap({ id, map, padding, titles }: Props) {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const n = calculateConcentricCircles(map.length);
  const gap = 6;
  const initRadius = calculateMaxHexWidthRadius(n, width, gap);
  const initHeight = calcHexHeight(initRadius) * 7 + 6 * gap;
  const clampedHeight = Math.min(initHeight, 1000);
  const radius = calculateMaxHexRadius(n, width, clampedHeight, gap);

  return (
    <MapContext.Provider
      value={{
        width,
        height: clampedHeight,
        radius,
        gap,
        hOffset: -radius + height * 0.5 + padding,
        wOffset: -radius + width * 0.5 + padding,
        disabled: false,
      }}
    >
      <Box ref={ref} w="100%" h={`${clampedHeight}px`}>
        {width > 0 &&
          map
            .filter((t) => !!t.position)
            .map((tile, idx) => (
              <DemoMapTile key={idx} mapId={id} tile={tile} titles={titles} />
            ))}
      </Box>
    </MapContext.Provider>
  );
}

type DemoMapTileProps = {
  mapId: string;
  tile: DemoTile;
  titles: string[];
};

export function DemoMapTile({
  mapId,
  tile,
  tile: { position },
  titles,
}: DemoMapTileProps) {
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: JSX.Element | null;
  if (tile.type === "PLAYER_DEMO") {
    Tile = (
      <PlayerDemoTile
        tile={tile}
        title={titles[tile.playerNumber]}
        color={playerColors[tile.playerNumber]}
      />
    );
  } else if (tile.type === "SYSTEM" && tile.systemId === "18") {
    Tile = <MecatolTile mapId={`${mapId}-mecatol`} tile={tile} hideValues />;
  } else if (tile.type === "SYSTEM") {
    Tile = <SystemTile mapId={`${mapId}-system`} tile={tile} hideValues />;
  } else if (tile.type === "CLOSED") {
    Tile = null;
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
