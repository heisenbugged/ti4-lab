import { Hex } from "../Hex";
import { Tile } from "~/types";
import { useContext } from "react";
import { MapContext } from "../MapContext";
import { Button, darken, lighten } from "@mantine/core";

type Props = {
  mapId: string;
  tile: Tile;
  modifiable?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({ mapId, onSelect, modifiable = false }: Props) {
  const { radius } = useContext(MapContext);

  return (
    <Hex
      id={`${mapId}-empty`}
      radius={radius}
      color={modifiable ? "#d6d6ea" : lighten("#d6d6ea", 0.8)}
      showBorder={!modifiable}
    />
  );
}
