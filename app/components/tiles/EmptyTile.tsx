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
  hoverEffects?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({
  mapId,
  modifiable = false,
  droppable = false,
  ringHighlight = false,
  isOver = false,
  hoverEffects = true,
  onSelect,
}: Props) {
  const { radius } = useContext(MapContext);

  const droppableClass = droppable
    ? hoverEffects
      ? classes.droppable
      : classes.droppableStatic
    : "";
  const ringHighlightClass =
    ringHighlight && !droppable
      ? hoverEffects
        ? classes.ringHighlight
        : classes.ringHighlightStatic
      : "";

  const colorClasses = [
    classes.empty,
    modifiable ? classes.modifiable : "",
    droppableClass,
    ringHighlightClass,
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
