import { Planet, Wormhole } from "~/types";
import { hasLegendaryImage } from "../constants";
import { calculateItemPositions } from "../layoutUtils.server";
import { drawPlanet } from "./planetRenderer.server";
import { drawWormhole } from "./wormholeRenderer.server";
import { drawGravityRift } from "./anomalyRenderer.server";

export function drawSystemId(
  ctx: CanvasRenderingContext2D,
  systemId: string,
  centerX: number,
  centerY: number,
  hexRadius: number,
  hasHyperlane: boolean = false,
): void {
  const scale = hexRadius / 80;
  const fontSize = 8;
  const scaledFontSize = fontSize * scale;
  const yOffset = 12 * scale;
  const topPadding = 2 * scale;
  const textY = centerY - hexRadius + yOffset + topPadding;

  ctx.save();
  ctx.font = `bold ${scaledFontSize}px Quantico, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Add translucent black background for hyperlane tiles
  if (hasHyperlane) {
    const metrics = ctx.measureText(systemId);
    const padding = 2 * scale;
    const bgWidth = metrics.width + padding * 2;
    const bgHeight = scaledFontSize + padding * 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(
      centerX - bgWidth / 2,
      textY - padding,
      bgWidth,
      bgHeight
    );
  }

  ctx.fillStyle = "white";
  ctx.fillText(systemId, centerX, textY);
  ctx.restore();
}

export function drawPlanetsWormholesAndGravityRifts(
  ctx: CanvasRenderingContext2D,
  planets: Planet[],
  wormholes: Wormhole[],
  hasGravityRift: boolean,
  systemId: string,
  centerX: number,
  centerY: number,
): void {
  const totalItems =
    planets.length + wormholes.length + (hasGravityRift ? 1 : 0);
  const hasLegendary = hasLegendaryImage(systemId);

  const positions = calculateItemPositions(totalItems, centerX, centerY);
  let drawn = 0;

  // Draw planets
  for (let i = 0; i < planets.length && drawn < positions.length; i++) {
    const pos = positions[drawn];
    drawPlanet(ctx, planets[i], systemId, hasLegendary, pos.x, pos.y);
    drawn++;
  }

  // Draw wormholes
  for (let i = 0; i < wormholes.length && drawn < positions.length; i++) {
    const pos = positions[drawn];
    drawWormhole(ctx, wormholes[i], pos.x, pos.y);
    drawn++;
  }

  // Draw gravity rift if needed
  if (hasGravityRift && drawn < positions.length) {
    const pos = positions[drawn];
    drawGravityRift(ctx, pos.x, pos.y);
  }
}
