import { ReactNode } from "react";
import { hexVertices, interpolatePoint } from "./hexUtils";
import { AnomalyBorder } from "./AnomalyBorder";
import { HexBorder } from "./HexBorder";
import { FactionId } from "~/types";
import { FactionIcon } from "../icons/FactionIcon";

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
  faction?: FactionId;
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
  faction,
}: Props) {
  const points = hexVertices(radius);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  // Define the start and end points for the hyperlane
  // const startX = points[5].x; // North edge
  // const startY = points[5].y; // North edge

  const { x: startX, y: startY } = interpolatePoint(points[0], points[5], 0.5);
  const { x: endX, y: endY } = interpolatePoint(points[3], points[4], 0.5);

  // Define the control points for the Bezier curve (adjust as needed for the desired curvature)
  const controlX1 = radius * 0.25;
  const controlY1 = radius * 0.25;
  const controlX2 = -radius * 0.25;
  const controlY2 = 0;

  // Create the path string for the hyperlane
  const pathString = `M${startX},${startY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;

  return (
    <>
      <div style={{ position: "absolute" }}>
        <svg
          width={2 * radius}
          height={2 * radius}
          viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="6" result="coloredBlur2" />
              <feMerge>
                <feMergeNode in="coloredBlur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <polygon points={pointsString} fill={color} className={colorClass} />
          <path
            d={pathString}
            stroke="purple"
            strokeWidth="4"
            fill="none"
            filter="url(#glow2)"
          />
          <path
            d={pathString}
            stroke="blue"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
          />
          <path
            d={pathString}
            stroke="white"
            strokeWidth="2"
            fill="none"
            // filter="url(#glow)"
          />
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
          {faction && (
            <HexFactionIndicator radius={radius} hexPoints={points} />
          )}
        </svg>
      </div>

      <div
        style={{
          width: radius * 2,
          height: radius * 2,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          position: "relative",
        }}
      >
        {faction && (
          <FactionIcon
            faction={faction}
            style={{
              width: radius * 0.35,
              height: radius * 0.35,
              position: "absolute",
              top: radius * 1.5,
              left: radius * 0.45,
            }}
          />
        )}
        {children}
      </div>
    </>
  );
}

function HexFactionIndicator({
  radius,
  hexPoints,
}: {
  radius: number;
  hexPoints: { x: number; y: number }[];
}) {
  // interpolate points 1 and 2
  const point1 = interpolatePoint(hexPoints[1], hexPoints[2], 0.45);

  // interpolate the y of point1 and hexPoints[3]
  const point2 = {
    x: interpolatePoint(point1, hexPoints[3], 0.25).x,
    y: interpolatePoint(point1, hexPoints[3], 0.45).y,
  };

  const point3 = interpolatePoint(hexPoints[2], hexPoints[3], 0.45);

  const points = [point1, point2, point3, hexPoints[2]];

  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <>
      <polygon points={pointsString} fill="rgba(0, 0, 0, 0.6)" />
    </>
  );
}
