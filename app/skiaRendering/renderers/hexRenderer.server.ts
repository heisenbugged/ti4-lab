import { Tile, HydratedPlayer } from "~/types";
import { TILE_COLORS } from "../constants";
import { generateHexVertices, createHexPath, clipToHex } from "../hexUtils.server";
import { getHexPosition } from "~/utils/positioning";
import { systemData } from "~/data/systemData";
import { drawAnomaly, drawAnomalyBorder } from "./anomalyRenderer.server";
import {
  drawPlanetsWormholesAndGravityRifts,
  drawSystemId,
} from "./systemRenderer.server";
import { drawHomeTileContent } from "./homeRenderer.server";
import { withContext } from "../canvasUtils.server";

export function drawHexTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  hydratedPlayers: HydratedPlayer[],
  radius: number,
  gap: number,
  hOffset: number,
  wOffset: number,
): void {
  const { x, y } = getHexPosition(
    tile.position.x,
    tile.position.y,
    radius,
    gap,
  );
  const centerX = x + wOffset + radius;
  const centerY = y + hOffset + radius;

  const vertices = generateHexVertices(centerX, centerY, radius);

  // Draw hexagon
  createHexPath(ctx, vertices);
  ctx.fillStyle = TILE_COLORS[tile.type];
  ctx.fill();

  // Draw anomalies for SYSTEM tiles (with hex clipping)
  if (tile.type === "SYSTEM") {
    const system = systemData[tile.systemId];
    if (system && system.anomalies.length > 0) {
      withContext(ctx, () => {
        clipToHex(ctx, centerX, centerY, radius);
        system.anomalies.forEach((anomaly) => {
          if (anomaly !== "GRAVITY_RIFT") {
            drawAnomaly(ctx, anomaly, centerX, centerY, radius);
          }
        });
      });
    }
  }

  // Draw planets, wormholes, and gravity rifts for SYSTEM tiles
  if (tile.type === "SYSTEM") {
    const system = systemData[tile.systemId];
    if (system) {
      const hasGravityRift = system.anomalies.includes("GRAVITY_RIFT");
      const items = [...system.planets, ...system.wormholes];
      if (hasGravityRift) items.push("GRAVITY_RIFT" as any);

      if (items.length > 0) {
        drawPlanetsWormholesAndGravityRifts(
          ctx,
          system.planets,
          system.wormholes,
          hasGravityRift,
          tile.systemId,
          centerX,
          centerY,
        );
      }

      // Draw anomaly border if system has anomalies
      if (system.anomalies.length > 0) {
        drawAnomalyBorder(ctx, centerX, centerY, radius);
      }

      // Draw hyperlanes
      const hasHyperlanes = system.hyperlanes && system.hyperlanes.length > 0;
      if (hasHyperlanes && system.hyperlanes) {
        const rotation = tile.rotation ?? 0;
        drawHyperlanes(ctx, system.hyperlanes, vertices, rotation);
      }

      // Draw system ID at top center (with background for hyperlane tiles)
      drawSystemId(ctx, tile.systemId, centerX, centerY, radius, hasHyperlanes);
    }
  }

  // Draw HOME tile content
  if (tile.type === "HOME" && tile.playerId !== undefined) {
    const player = hydratedPlayers.find((p) => p.id === tile.playerId);
    if (player?.faction) {
      drawHomeTileContent(ctx, player, centerX, centerY, radius);
    }
  }
}

function drawHyperlanes(
  ctx: CanvasRenderingContext2D,
  hyperlanes: number[][],
  vertices: { x: number; y: number }[],
  rotation: number = 0,
): void {
  // Rotate side indices based on tile rotation
  // Rotation is in degrees, each hex side is 60 degrees
  // Convert rotation to side offset (wrap around 6 sides)
  const sideOffset = Math.round((rotation / 60) % 6);
  const normalizedOffset = ((sideOffset % 6) + 6) % 6;

  const sides = calculateHexSides(vertices);

  // Calculate hex center from vertices
  const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

  hyperlanes.forEach(([start, end]) => {
    // Rotate side indices based on tile rotation
    const rotatedStart = (start + normalizedOffset) % 6;
    const rotatedEnd = (end + normalizedOffset) % 6;

    const p1 = sides[rotatedStart];
    const p2 = sides[rotatedEnd];

    // Draw blue glow layer
    withContext(ctx, () => {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 4;
      ctx.shadowColor = "blue";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(centerX, centerY, centerX, centerY, p2.x, p2.y);
      ctx.stroke();
    });

    // Draw light blue layer
    withContext(ctx, () => {
      ctx.strokeStyle = "#7ca8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(centerX, centerY, centerX, centerY, p2.x, p2.y);
      ctx.stroke();
    });

    // Draw white center line
    withContext(ctx, () => {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(centerX, centerY, centerX, centerY, p2.x, p2.y);
      ctx.stroke();
    });
  });
}

function calculateHexSides(
  vertices: { x: number; y: number }[],
): { x: number; y: number }[] {
  const interpolate = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    t: number,
  ) => ({
    x: (1 - t) * a.x + t * b.x,
    y: (1 - t) * a.y + t * b.y,
  });

  return [
    interpolate(vertices[4], vertices[5], 0.5),
    interpolate(vertices[5], vertices[0], 0.5),
    interpolate(vertices[0], vertices[1], 0.5),
    interpolate(vertices[1], vertices[2], 0.5),
    interpolate(vertices[2], vertices[3], 0.5),
    interpolate(vertices[3], vertices[4], 0.5),
  ];
}
