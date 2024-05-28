import { Hex } from "../Hex";
import { PlayerDemoTile as TPlayerDemoTile } from "~/types";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { Title } from "@mantine/core";

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
      color={tile.idx === 0 ? "var(--mantine-color-spaceBlue-5)" : color}
      showBorder={tile.playerNumber === 6}
    >
      {tile.isHomeSystem && (
        <Title size={24} fw={600}>
          {title}
        </Title>
      )}
    </Hex>
  );
}
