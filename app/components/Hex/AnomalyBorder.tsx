import { hexVertices, interpolatePoint } from "./hexUtils";

type Props = {
  radius: number;
  points: { x: number; y: number }[];
};

export function AnomalyBorder({ radius }: Props) {
  const strokeWidth = radius / 15;
  // reduce radius by half of stroke width so that the border is inside the hex
  const points = hexVertices(radius - strokeWidth * 0.5);
  const borderSegments = points.flatMap((point, index, arr) => {
    const nextIndex = (index + 1) % arr.length;
    const prevIndex = (index - 1 + arr.length) % arr.length;
    return [
      [point, interpolatePoint(point, points[nextIndex], 0.2)],
      [point, interpolatePoint(point, points[prevIndex], 0.2)],
    ];
  });

  return (
    <>
      {borderSegments.map(([pointA, pointB], index) => (
        <line
          key={index}
          x1={pointA.x}
          y1={pointA.y}
          x2={pointB.x}
          y2={pointB.y}
          stroke="red"
          strokeWidth={strokeWidth.toString()}
        />
      ))}
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r={radius / 40} fill="red" />
      ))}
    </>
  );
}
