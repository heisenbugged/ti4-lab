import { ReactNode } from "react";
import { hexSides, hexVertices } from "./hexUtils";
import { AnomalyBorder } from "./AnomalyBorder";
import { HexBorder } from "./HexBorder";
import { FactionId } from "~/types";
import { FactionIcon } from "../icons/FactionIcon";
import { HexFactionIndicator } from "./HexFactionIndicator";
import { HyperlaneLine } from "./HyperlaneLine";

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
  hyperlanes?: number[][];
  style?: React.CSSProperties;
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
  hyperlanes,
  style = {},
}: Props) {
  const points = hexVertices(radius);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <>
      <div style={{ position: "absolute", ...style }}>
        <svg
          width={2 * radius}
          height={2 * radius}
          viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}
        >
          <defs>
            {hyperlanes && (
              <filter id="glow" y="-100%" height="400%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
            {image && (
              <clipPath id={`hexClip-${id}`}>
                <polygon points={pointsString} />
              </clipPath>
            )}
          </defs>

          <polygon points={pointsString} fill={color} className={colorClass} />
          {showBorder && (
            <HexBorder
              radius={radius}
              borderRadius={borderRadius}
              className={borderColorClass}
            />
          )}
          {hyperlanes && (
            <>
              {/* Show blue glow */}
              <g filter="url(#glow)">
                {hyperlanes?.map(([start, end], idx) => {
                  const sides = hexSides(points);
                  return (
                    <HyperlaneLine
                      key={idx}
                      p1={sides[start]}
                      p2={sides[end]}
                      color="blue"
                    />
                  );
                })}
              </g>
              {/* Show white hyperlane */}
              <g>
                {hyperlanes?.map(([start, end], idx) => {
                  const sides = hexSides(points);
                  return (
                    <HyperlaneLine
                      key={idx}
                      p1={sides[start]}
                      p2={sides[end]}
                      color="#7ca8ff"
                    />
                  );
                })}
              </g>
              <g>
                {hyperlanes?.map(([start, end], idx) => {
                  const sides = hexSides(points);
                  return (
                    <HyperlaneLine
                      key={idx}
                      p1={sides[start]}
                      p2={sides[end]}
                      color="white"
                      width="0.5"
                    />
                  );
                })}
              </g>
            </>
          )}

          {image && <g clipPath={`url(#hexClip-${id})`}>{image}</g>}
          {anomaly && <AnomalyBorder radius={radius} points={points} />}
          {faction && <HexFactionIndicator hexPoints={points} />}
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
