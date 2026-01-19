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
  ringHighlight?: boolean;
  isOver?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({
  mapId,
  modifiable = false,
  droppable = false,
  ringHighlight = false,
  isOver = false,
  onSelect,
}: Props) {
  const { radius } = useContext(MapContext);

  const colorClasses = [
    classes.empty,
    modifiable ? classes.modifiable : "",
    droppable ? classes.droppable : "",
    ringHighlight && !droppable ? classes.ringHighlight : "",
    isOver ? classes.droppableHover : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onClick={onSelect}
      style={{ cursor: onSelect ? "pointer" : undefined }}
    >
      <Hex
        id={`${mapId}-empty`}
        radius={radius}
        colorClass={colorClasses}
        showBorder={!modifiable}
        borderClass={droppable ? classes.droppableBorder : undefined}
      />
    </div>
  );
}
