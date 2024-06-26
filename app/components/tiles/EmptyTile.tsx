import { Hex } from "../Hex";
import { OpenTile } from "~/types";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";

import classes from "./Tiles.module.css";

type Props = {
  mapId: string;
  tile: OpenTile;
  modifiable?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({ mapId, modifiable = false }: Props) {
  const { radius } = useContext(MapContext);

  return (
    <Hex
      id={`${mapId}-empty`}
      radius={radius}
      colorClass={`${classes.empty} ${modifiable ? classes.modifiable : ""}`}
      showBorder={!modifiable}
    />
  );
}
