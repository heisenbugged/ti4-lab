import { ReactNode } from "react";
import { hexVertices } from "./hexUtils";

type Props = {
  radius: number;
  borderRadius?: number;
};

export function HexBorder({ radius, borderRadius }: Props) {
  const strokeWidth = borderRadius ?? 1;
  // reduce radius by half of stroke width so that the border is inside the hex
  const points = hexVertices(radius - strokeWidth * 0.5);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <polygon
      points={pointsString}
      stroke="#e5e5e5"
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  );
}
