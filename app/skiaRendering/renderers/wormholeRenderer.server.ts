import { Wormhole } from "~/types";
import { WORMHOLE_COLORS } from "../constants";
import { withContext } from "../canvasUtils.server";

export function drawWormhole(
  ctx: CanvasRenderingContext2D,
  wormhole: Wormhole,
  centerX: number,
  centerY: number,
): void {
  const wormholeSize = 90;
  const wormholeRadius = wormholeSize / 2;
  const centerRadius = wormholeRadius * 0.5;
  const color = WORMHOLE_COLORS[wormhole];

  // Draw outer circle (dark blue background)
  ctx.fillStyle = "#324b7c";
  ctx.beginPath();
  ctx.arc(centerX, centerY, wormholeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw colored center circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw swirl pattern
  const scale = wormholeSize / 150;
  const offsetX = centerX - (15 + 150 / 2) * scale;
  const offsetY = centerY - (25 + 200 / 2) * scale;

  drawWormholeSwirl(ctx, color, scale, offsetX, offsetY);

  // Draw letter overlays for specific wormholes
  if (wormhole === "ALPHA") {
    drawAlphaLetter(ctx, scale, offsetX, offsetY);
  } else if (wormhole === "BETA") {
    drawBetaLetter(ctx, scale, offsetX, offsetY);
  } else if (wormhole === "GAMMA") {
    drawGammaLetter(ctx, scale, offsetX, offsetY);
  }
}

function drawWormholeSwirl(
  ctx: CanvasRenderingContext2D,
  color: string,
  scale: number,
  offsetX: number,
  offsetY: number,
): void {
  withContext(ctx, () => {
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;

    // Path 1
    ctx.beginPath();
    ctx.moveTo(28.86, 135.49);
    ctx.bezierCurveTo(28.86, 137.69, 31.98, 137.54, 31.98, 135.44);
    ctx.bezierCurveTo(31.98, 112, 50.78, 83.73, 84.03, 83.73);
    ctx.bezierCurveTo(117.28, 83.73, 129.44, 118.5, 122.07, 134.32);
    ctx.bezierCurveTo(120.71, 137.24, 123.19, 137.85, 124.85, 135.74);
    ctx.bezierCurveTo(137.55, 119.63, 126.66, 74.02, 83.25, 74.02);
    ctx.bezierCurveTo(41.07, 74.02, 28.86, 117.33, 28.86, 135.49);
    ctx.closePath();
    ctx.fill();

    // Path 2
    ctx.beginPath();
    ctx.moveTo(83.87, 64.83);
    ctx.bezierCurveTo(81.67, 64.83, 81.82, 67.95, 83.92, 67.95);
    ctx.bezierCurveTo(107.36, 67.95, 135.63, 86.75, 135.63, 120);
    ctx.bezierCurveTo(135.63, 153.25, 100.86, 165.41, 85.04, 158.04);
    ctx.bezierCurveTo(82.12, 156.68, 81.51, 159.16, 83.62, 160.82);
    ctx.bezierCurveTo(99.73, 173.52, 145.34, 162.63, 145.34, 119.22);
    ctx.bezierCurveTo(145.34, 77.04, 102.03, 64.83, 83.87, 64.83);
    ctx.closePath();
    ctx.fill();

    // Path 3
    ctx.beginPath();
    ctx.moveTo(153.91, 120.05);
    ctx.bezierCurveTo(153.91, 117.85, 150.79, 118, 150.79, 120.1);
    ctx.bezierCurveTo(150.79, 143.54, 131.99, 171.81, 98.74, 171.81);
    ctx.bezierCurveTo(65.49, 171.81, 53.33, 137.04, 60.7, 121.22);
    ctx.bezierCurveTo(62.06, 118.3, 59.58, 117.69, 57.92, 119.8);
    ctx.bezierCurveTo(45.22, 135.91, 56.11, 181.52, 99.52, 181.52);
    ctx.bezierCurveTo(141.7, 181.52, 153.91, 138.21, 153.91, 120.05);
    ctx.closePath();
    ctx.fill();

    // Path 4
    ctx.beginPath();
    ctx.moveTo(98.28, 190.29);
    ctx.bezierCurveTo(100.48, 190.29, 100.33, 187.17, 98.23, 187.17);
    ctx.bezierCurveTo(74.79, 187.17, 46.52, 168.37, 46.52, 135.12);
    ctx.bezierCurveTo(46.52, 101.87, 81.28, 89.71, 97.1, 97.08);
    ctx.bezierCurveTo(100.02, 98.44, 100.63, 95.96, 98.52, 94.3);
    ctx.bezierCurveTo(82.41, 81.6, 36.8, 92.49, 36.8, 135.9);
    ctx.bezierCurveTo(36.8, 178.09, 80.11, 190.29, 98.28, 190.29);
    ctx.closePath();
    ctx.fill();
  });
}

function drawAlphaLetter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  offsetX: number,
  offsetY: number,
): void {
  withContext(ctx, () => {
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.moveTo(95.58, 115.66);
    ctx.bezierCurveTo(95.58, 109.74, 94.7, 109.46, 86.84, 109.46);
    ctx.bezierCurveTo(83.93, 109.46, 77.36, 109.46, 77.36, 109.46);
    ctx.lineTo(77.36, 103.89);
    ctx.bezierCurveTo(77.36, 103.89, 82.69, 103.89, 95.29, 103.89);
    ctx.bezierCurveTo(102.84, 103.89, 103.29, 111.54, 103.29, 114.27);
    ctx.bezierCurveTo(103.29, 117, 103.29, 129.64, 103.29, 129.64);
    ctx.bezierCurveTo(103.29, 129.64, 99.6, 129.64, 95.59, 129.64);
    ctx.bezierCurveTo(95.59, 122.44, 92.77, 119.95, 86.85, 119.95);
    ctx.bezierCurveTo(80.93, 119.95, 80.5, 124.04, 80.5, 127.12);
    ctx.bezierCurveTo(80.5, 131.57, 81.07, 136.35, 86.85, 136.35);
    ctx.bezierCurveTo(91.97, 136.35, 102.86, 136.35, 102.86, 136.35);
    ctx.bezierCurveTo(102.86, 136.35, 102.91, 137.82, 102.86, 141.97);
    ctx.bezierCurveTo(102.83, 144.84, 104.95, 145.45, 109.48, 145.45);
    ctx.bezierCurveTo(109.48, 146.59, 109.48, 150.95, 109.48, 150.95);
    ctx.bezierCurveTo(109.48, 150.95, 106.73, 150.95, 102.86, 150.95);
    ctx.bezierCurveTo(96.83, 150.95, 95.59, 144.59, 95.59, 141.96);
    ctx.bezierCurveTo(93.2, 141.96, 93.77, 141.96, 86.85, 141.96);
    ctx.bezierCurveTo(75.67, 141.96, 73.35, 135.97, 73.35, 127.11);
    ctx.bezierCurveTo(73.35, 115.61, 82.3, 114.26, 86.85, 114.26);
    ctx.bezierCurveTo(91.4, 114.26, 95.58, 115.66, 95.58, 115.66);
    ctx.closePath();
    ctx.fill();
  });
}

function drawBetaLetter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  offsetX: number,
  offsetY: number,
): void {
  withContext(ctx, () => {
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(24, 76);
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.moveTo(53.71, 26.63);
    ctx.bezierCurveTo(53.71, 26.63, 57.92, 26.63, 67.05, 26.63);
    ctx.bezierCurveTo(82.63, 26.63, 82.91, 34.03, 82.91, 37.28);
    ctx.bezierCurveTo(82.91, 40.58, 80.3, 45.53, 76.28, 45.53);
    ctx.bezierCurveTo(80.5, 45.53, 83.07, 50.83, 83.07, 53.75);
    ctx.bezierCurveTo(83.07, 56.67, 82.91, 64.43, 66.16, 64.43);
    ctx.bezierCurveTo(66.16, 59.86, 66.16, 59.16, 66.16, 59.16);
    ctx.bezierCurveTo(66.16, 59.16, 74.91, 59.29, 74.91, 54.56);
    ctx.bezierCurveTo(74.91, 49.83, 70.76, 49.4, 66.16, 49.4);
    ctx.bezierCurveTo(66.16, 44.67, 66.16, 44.21, 66.16, 41.62);
    ctx.bezierCurveTo(67.71, 41.62, 74.89, 41.85, 74.89, 37.28);
    ctx.bezierCurveTo(74.89, 32.71, 72.37, 32.32, 67.94, 32.32);
    ctx.bezierCurveTo(63.51, 32.32, 60.52, 32.32, 60.52, 32.32);
    ctx.lineTo(60.52, 73.85);
    ctx.lineTo(53.71, 73.85);
    ctx.bezierCurveTo(53.71, 53.34, 53.43, 26.35, 53.71, 26.63);
    ctx.closePath();
    ctx.fill();
  });
}

function drawGammaLetter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  offsetX: number,
  offsetY: number,
): void {
  withContext(ctx, () => {
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-10, -4);
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.moveTo(80.31, 104.99);
    ctx.lineTo(80.31, 110.18);
    ctx.lineTo(86.33, 110.18);
    ctx.lineTo(96.61, 136.35);
    ctx.lineTo(96.61, 154.31);
    ctx.bezierCurveTo(96.61, 154.31, 101.91, 154.73, 104.5, 152.13);
    ctx.bezierCurveTo(104.5, 149.33, 104.5, 136.35, 104.5, 136.35);
    ctx.lineTo(92.97, 104.99);
    ctx.lineTo(80.31, 104.99);
    ctx.closePath();
    ctx.moveTo(109.39, 104.99);
    ctx.lineTo(103.68, 120.25);
    ctx.lineTo(107.94, 130.43);
    ctx.lineTo(118.22, 104.99);
    ctx.lineTo(109.39, 104.99);
    ctx.closePath();
    ctx.fill();
  });
}
