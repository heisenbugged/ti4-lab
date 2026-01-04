import { useContext, useMemo } from "react";
import { MapContext } from "~/contexts/MapContext";
import { getHexPosition } from "~/utils/positioning";
import type { Map as TiMap } from "~/types";
import type { TileContribution } from "~/mapgen/utils/sliceScoring";
import {
  buildHexGraphWithExclusions,
  getGraphPath,
} from "~/utils/hexDistance";
import { systemData } from "~/data/systemData";

type Props = {
  map: TiMap;
  hoveredHomeIdx: number | null;
  tileContributions?: Record<number, Map<number, TileContribution>>;
};

export function EquidistantLines({
  map,
  hoveredHomeIdx,
  tileContributions,
}: Props) {
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);

  // Helper to get tile center in screen coordinates
  const getTileCenter = (idx: number) => {
    const tile = map[idx];
    if (!tile?.position) return null;
    const { x, y } = getHexPosition(tile.position.x, tile.position.y, radius, gap);
    return {
      x: x + wOffset + radius,
      y: y + hOffset + radius,
    };
  };

  // Check if a tile has a supernova or nebula
  const hasAnomaly = (idx: number): "SUPERNOVA" | "NEBULA" | null => {
    const tile = map[idx];
    if (tile?.type !== "SYSTEM") return null;
    const system = systemData[tile.systemId];
    if (!system) return null;
    if (system.anomalies.includes("SUPERNOVA")) return "SUPERNOVA";
    if (system.anomalies.includes("NEBULA")) return "NEBULA";
    return null;
  };

  // Calculate path to Mecatol for the hovered home
  const pathToMecatol = useMemo(() => {
    if (hoveredHomeIdx === null) return [];

    // Find all home indices
    const homeIndices: number[] = [];
    map.forEach((tile, idx) => {
      if (tile.type === "HOME") homeIndices.push(idx);
    });

    // Build graph excluding OTHER homes (not the hovered one)
    const otherHomeIndices = new Set(homeIndices.filter((h) => h !== hoveredHomeIdx));
    const graph = buildHexGraphWithExclusions(map, otherHomeIndices);

    // Get path from hovered home to Mecatol (index 0)
    return getGraphPath(graph, hoveredHomeIdx, 0);
  }, [map, hoveredHomeIdx]);

  // Only render when hovering a home
  if (hoveredHomeIdx === null) return null;

  const contributions = tileContributions?.[hoveredHomeIdx];

  // Find all home indices for equidistant lines
  const homeIndices: number[] = [];
  map.forEach((tile, idx) => {
    if (tile.type === "HOME") homeIndices.push(idx);
  });

  // Collect equidistant lines
  const equidistantLines: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];

  if (contributions) {
    for (const [tileIdx, contribution] of contributions) {
      if (contribution.percentage >= 1) continue; // Not equidistant

      const tileCenter = getTileCenter(tileIdx);
      if (!tileCenter) continue;

      // Draw lines to OTHER homes (not the hovered one)
      for (const otherHomeIdx of homeIndices) {
        if (otherHomeIdx === hoveredHomeIdx) continue;

        // Check if this other home also has this tile as equidistant
        const otherContributions = tileContributions?.[otherHomeIdx];
        if (!otherContributions?.has(tileIdx)) continue;

        const homeCenter = getTileCenter(otherHomeIdx);
        if (!homeCenter) continue;

        equidistantLines.push({ from: tileCenter, to: homeCenter });
      }
    }
  }

  // Build path to Mecatol polyline points and anomaly markers
  const pathPoints: { x: number; y: number }[] = [];
  const anomalyMarkers: { x: number; y: number; type: "SUPERNOVA" | "NEBULA" }[] = [];

  for (let i = 0; i < pathToMecatol.length; i++) {
    const idx = pathToMecatol[i];
    const center = getTileCenter(idx);
    if (center) {
      pathPoints.push(center);

      // Check for anomaly on this tile (skip first tile which is the home)
      if (i > 0 && i < pathToMecatol.length - 1) {
        const anomaly = hasAnomaly(idx);
        if (anomaly) {
          anomalyMarkers.push({ ...center, type: anomaly });
        }
      }
    }
  }

  // Create polyline string for path
  const pathString = pathPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const hasContent = equidistantLines.length > 0 || pathPoints.length > 1;
  if (!hasContent) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 15, // Below badges (20) but above tiles
      }}
    >
      {/* Path to Mecatol */}
      {pathPoints.length > 1 && (
        <polyline
          points={pathString}
          fill="none"
          stroke="cyan"
          strokeWidth={2}
          strokeDasharray="8,6"
          opacity={0.9}
        />
      )}

      {/* Anomaly markers (red X) on path */}
      {anomalyMarkers.map((marker, i) => (
        <g key={`anomaly-${i}`} transform={`translate(${marker.x}, ${marker.y})`}>
          <line
            x1={-8}
            y1={-8}
            x2={8}
            y2={8}
            stroke="red"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={8}
            y1={-8}
            x2={-8}
            y2={8}
            stroke="red"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Equidistant lines */}
      {equidistantLines.map((line, i) => (
        <line
          key={`eq-${i}`}
          x1={line.from.x}
          y1={line.from.y}
          x2={line.to.x}
          y2={line.to.y}
          stroke="orange"
          strokeWidth={1.5}
          strokeDasharray="4,4"
          opacity={0.8}
        />
      ))}
    </svg>
  );
}
