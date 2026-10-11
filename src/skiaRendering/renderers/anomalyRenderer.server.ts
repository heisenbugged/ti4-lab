import { Anomaly } from "~/types";
import { ANOMALY_SCALES } from "../constants";
import { getAnomalyImageCache } from "../cache.server";
import { generateHexVertices, interpolatePoint } from "../hexUtils.server";
import { withContext } from "../canvasUtils.server";

export function drawAnomaly(
  ctx: CanvasRenderingContext2D,
  anomaly: Anomaly,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const anomalyImageCache = getAnomalyImageCache();
  if (!anomalyImageCache) return;

  const image = anomalyImageCache[anomaly];
  if (!image) return;

  const scale = ANOMALY_SCALES[anomaly];
  const imageSize = radius * 2 * scale;

  ctx.drawImage(
    image,
    centerX - imageSize / 2,
    centerY - imageSize / 2,
    imageSize,
    imageSize,
  );
}

export function drawGravityRift(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
): void {
  const size = 60;
  const radius = size / 2;

  withContext(ctx, () => {
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw black circle twice for layered glow effect
    ctx.fillStyle = "black";
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw white border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

export function drawAnomalyBorder(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const strokeWidth = radius / 15;
  const borderRadius = radius - strokeWidth * 0.5;

  const points = generateHexVertices(centerX, centerY, borderRadius);

  ctx.strokeStyle = "red";
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";

  points.forEach((point, index) => {
    const nextIndex = (index + 1) % points.length;
    const prevIndex = (index - 1 + points.length) % points.length;

    // Line towards next vertex (20% of the way)
    const toNext = interpolatePoint(point, points[nextIndex], 0.2);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(toNext.x, toNext.y);
    ctx.stroke();

    // Line towards previous vertex (20% of the way)
    const toPrev = interpolatePoint(point, points[prevIndex], 0.2);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(toPrev.x, toPrev.y);
    ctx.stroke();
  });

  // Draw circles at each vertex
  ctx.fillStyle = "red";
  const circleRadius = radius / 40;
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, circleRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}
