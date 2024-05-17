import { ReactNode } from "react";
import { calcHexHeight } from "~/positioning";

interface Props {
  color: string;
  radius: number;
  children?: ReactNode;
}

export function Hex({ color, radius, children }: Props) {
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
