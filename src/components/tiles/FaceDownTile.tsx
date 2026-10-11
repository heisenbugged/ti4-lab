import { Hex } from "../Hex";
import classes from "./Tiles.module.css";

type Props = {
  mapId: string;
  radius: number;
  color: "blue" | "red";
};

export function FaceDownTile({ mapId, radius, color }: Props) {
  return (
    <Hex
      id={`${mapId}-face-down`}
      radius={radius}
      colorClass={color === "red" ? classes.red : classes.blue}
    />
  );
}
