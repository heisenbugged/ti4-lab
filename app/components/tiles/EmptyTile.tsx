import { Hex } from "../Hex";
import { OpenTile } from "~/types";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";

import classes from "./Tiles.module.css";

type Props = {
  mapId: string;
  tile: OpenTile;
  modifiable?: boolean;
  droppable?: boolean;
  isOver?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({ mapId, modifiable = false, droppable = false, isOver = false }: Props) {
  const { radius } = useContext(MapContext);

  return (
    <Hex
      id={`${mapId}-empty`}
      radius={radius}
      colorClass={`${classes.empty} ${modifiable ? classes.modifiable : ""} ${droppable ? classes.droppable : ""} ${isOver ? classes.droppableHover : ""}`}
      showBorder={!modifiable}
      borderClass={droppable ? classes.droppableBorder : undefined}
    />
  );
}
