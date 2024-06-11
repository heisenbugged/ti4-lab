import { ReactNode } from "react";
import { hexVertices, interpolatePoint } from "../Hex/hexUtils";
import classes from "./Tiles.module.css";

export function Hyperlane89B({ radius }: { radius: number }) {
  return (
    <HyperlaneHex colorClass={classes.system} radius={radius}>
      <g filter="url(#glow)">
        <NtoS radius={radius} color="blue" />
        <NEtoS radius={radius} color="blue" />
      </g>
      <g>
        <NtoS radius={radius} width="1.5" />
        <NEtoS radius={radius} width="1.5" />
      </g>
    </HyperlaneHex>
  );
}

export function Hyperlane87A({ radius }: { radius: number }) {
  return (
    <HyperlaneHex colorClass={classes.system} radius={radius}>
      <g filter="url(#glow)">
        <NtoS radius={radius} color="blue" />
        <NWtoS radius={radius} color="blue" />
        <NEtoS radius={radius} color="blue" />
      </g>
      <g>
        <NtoS radius={radius} width="1.5" />
        <NWtoS radius={radius} width="1.5" />
        <NEtoS radius={radius} width="1.5" />
      </g>
    </HyperlaneHex>
  );
}

export function Hyperlane83B({ radius }: { radius: number }) {
  return (
    <HyperlaneHex colorClass={classes.system} radius={radius}>
      <g filter="url(#glow)">
        <NEtoNW radius={radius} color="blue" />
        <NWtoSE radius={radius} color="blue" />
        <SWtoSE radius={radius} color="blue" />
      </g>
      <g>
        <NEtoNW radius={radius} width="1.5" />
        <NWtoSE radius={radius} width="1.5" />
        <SWtoSE radius={radius} width="1.5" />
      </g>
    </HyperlaneHex>
  );
}

function HyperlaneHex({
  children,
  colorClass,
  radius,
}: {
  children: ReactNode;
  colorClass: string;
  radius: number;
}) {
  const points = hexVertices(radius);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div style={{ position: "absolute" }}>
      <svg
        width={2 * radius}
        height={2 * radius}
        viewBox={`-${radius} -${radius} ${2 * radius} ${2 * radius}`}
      >
        <defs>
          <filter id="glow" y="-100%" height="400%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points={pointsString} className={colorClass} />
        {children}
      </svg>
    </div>
  );
}

type LineProps = {
  radius: number;
  color?: string;
  width?: string;
};

function NtoS({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = north(points);
  const p2 = south(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NtoSE({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = north(points);
  const p2 = southEast(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NtoSW({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = north(points);
  const p2 = southWest(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NWtoSE({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = northWest(points);
  const p2 = southEast(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;

  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NWtoS({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = northWest(points);
  const p2 = south(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NEtoNW({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = northEast(points);
  const p2 = northWest(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function NEtoS({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = northEast(points);
  const p2 = south(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

function SWtoSE({ radius, color = "white", width = "2" }: LineProps) {
  const points = hexVertices(radius);
  const p1 = southWest(points);
  const p2 = southEast(points);
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}

const north = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[4], points[5], 0.5);

const northEast = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[5], points[0], 0.5);

const south = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[1], points[2], 0.5);

const northWest = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[3], points[4], 0.5);

const southEast = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[0], points[1], 0.5);

const southWest = (points: { x: number; y: number }[]) =>
  interpolatePoint(points[2], points[3], 0.5);
