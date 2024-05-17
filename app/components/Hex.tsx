import { ReactNode } from "react";

interface Props {
  color: string;
  radius: number;
  children?: ReactNode;
  imageUrl?: string; // Add an imageUrl prop
  anomaly?: boolean;
}

export function Hex({ color, radius, children, imageUrl, anomaly }: Props) {
  const points = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * Math.PI) / 3;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <>
      <div style={{ position: "absolute", zIndex: -1 }}>
        <svg
          width={2 * radius}
          height={2 * radius}
          viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}
        >
          <polygon points={pointsString} fill={color} />
          <defs>
            <clipPath id="hexClip">
              <polygon points={pointsString} />
            </clipPath>
          </defs>
          <g clipPath="url(#hexClip)">
            {imageUrl && (
              <image
                href={imageUrl}
                x={-radius * 1.25}
                y={-radius * 1.25}
                width={2 * radius * 1.25}
                height={2 * radius * 1.25}
              />
            )}
          </g>

          {anomaly && <Anomaly radius={radius} points={points} />}
        </svg>
      </div>
      <div
        style={{
          width: radius * 2,
          height: radius * 2,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        {children}
      </div>
    </>
  );
}

function Anomaly({
  points,
  radius,
}: {
  radius: number;
  points: { x: number; y: number }[];
}) {
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
          strokeWidth={(radius / 20).toString()}
        />
      ))}
      {points.map((p) => (
        <circle cx={p.x} cy={p.y} r={radius / 40} fill="red" />
      ))}
    </>
  );
}

function interpolatePoint(a, b, t) {
  const x = (1 - t) * a.x + t * b.x;
  const y = (1 - t) * a.y + t * b.y;
  return { x, y };
}
