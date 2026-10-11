import { interpolatePoint } from "./hexUtils";

type Props = {
  hexPoints: { x: number; y: number }[];
};

export function HexFactionIndicator({ hexPoints }: Props) {
  const point1 = interpolatePoint(hexPoints[1], hexPoints[2], 0.45);
  const point2 = {
    x: interpolatePoint(point1, hexPoints[3], 0.25).x,
    y: interpolatePoint(point1, hexPoints[3], 0.45).y,
  };
  const point3 = interpolatePoint(hexPoints[2], hexPoints[3], 0.45);
  const points = [point1, point2, point3, hexPoints[2]];
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return <polygon points={pointsString} fill="rgba(0, 0, 0, 0.6)" />;
}
