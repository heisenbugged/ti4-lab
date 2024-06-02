import { Hex } from "../Hex";
import { PlayerDemoTile as TPlayerDemoTile } from "~/types";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { Title } from "@mantine/core";

import classes from "./Tiles.module.css";

type Props = {
  tile: TPlayerDemoTile;
  title: string;
  color: string;
};

export function PlayerDemoTile({ tile, title, color }: Props) {
  const { radius } = useContext(MapContext);
  return (
    <Hex
      id={`player-demo-${tile.playerNumber}-${tile.idx}`}
      radius={radius}
      colorClass={classes[color]}
      showBorder={tile.playerNumber === 6}
    >
      {tile.isHomeSystem && (
        <Title
          size={24}
          fw={600}
          style={{ zIndex: 1 }}
          className={classes.title}
        >
          {title}
        </Title>
      )}
    </Hex>
  );
}
