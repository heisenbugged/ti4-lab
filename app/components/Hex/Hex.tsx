import { ReactNode } from "react";
import { hexVertices } from "./hexUtils";
import { AnomalyBorder } from "./AnomalyBorder";
import { HexBorder } from "./HexBorder";

interface Props {
  id: string;
  color?: string;
  colorClass?: string;
  radius: number;
  children?: ReactNode;
  image?: JSX.Element;
  anomaly?: boolean;
  showBorder?: boolean;
  borderRadius?: number;
  borderColorClass?: string;
}

export function Hex({
  id,
  color,
  colorClass,
  radius,
  children,
  image,
  anomaly,
  showBorder = false,
  borderRadius,
  borderColorClass,
}: Props) {
  const points = hexVertices(radius);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <>
      <div style={{ position: "absolute" }}>
        <svg
          width={2 * radius}
          height={2 * radius}
          viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}
        >
          <polygon points={pointsString} fill={color} className={colorClass} />
          {showBorder && (
            <HexBorder
              radius={radius}
              borderRadius={borderRadius}
              className={borderColorClass}
            />
          )}
          <defs>
            <clipPath id={`hexClip-${id}`}>
              <polygon points={pointsString} />
            </clipPath>
          </defs>
          <g clipPath={`url(#hexClip-${id})`}>{image}</g>
          {anomaly && <AnomalyBorder radius={radius} points={points} />}
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
