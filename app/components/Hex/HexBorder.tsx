import { hexVertices } from "./hexUtils";

import classes from "./Hex.module.css";

type Props = {
  radius: number;
  borderRadius?: number;
  className?: string;
};

export function HexBorder({ radius, borderRadius, className }: Props) {
  const strokeWidth = borderRadius ?? 1;
  // reduce radius by half of stroke width so that the border is inside the hex
  const points = hexVertices(radius - strokeWidth * 0.5);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <polygon
      points={pointsString}
      className={`${classes.border} ${className ?? ""} `}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  );
}
