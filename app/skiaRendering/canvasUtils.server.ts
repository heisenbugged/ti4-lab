import { Canvas } from "skia-canvas";
import { Map, HydratedPlayer } from "~/types";
import {
  calculateConcentricCircles,
  calcHexHeight,
} from "~/utils/positioning";
import {
  getBackgroundTileCache,
  getLogoCache,
} from "./cache.server";
import { TILE_COLORS } from "./constants";
import { drawHexTile } from "./renderers/hexRenderer.server";

export interface CanvasDimensions {
  width: number;
  height: number;
  radius: number;
  gap: number;
  hOffset: number;
  wOffset: number;
}

/**
 * Calculate canvas dimensions for a hexagonal map
 */
export function calculateCanvasDimensions(map: Map): CanvasDimensions {
  const n = calculateConcentricCircles(map.length);
  const radius = 120;
  const gap = 10;
  const numTiles = n * 2 + 1;
  const hexHeight = calcHexHeight(radius);

  const mapWidth = numTiles * radius * 1.5 + (numTiles - 1) * gap + radius;
  const mapHeight = numTiles * hexHeight + (numTiles - 1) * gap;

  const width = Math.ceil(mapWidth + 100);
  const height = Math.ceil(mapHeight + 100 + 40);

  const hOffset = -radius + height * 0.5;
  const wOffset = -radius + width * 0.5;

  return { width, height, radius, gap, hOffset, wOffset };
}

export interface BackgroundOptions {
  /** Whether to draw a gradient overlay first (for slices view) */
  withGradient?: boolean;
  /** Opacity for background tile overlay (default: 1.0) */
  tileOpacity?: number;
}

/**
 * Draw background with optional gradient and tiled background image
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: BackgroundOptions = {},
): void {
  const { withGradient = false, tileOpacity = 1.0 } = options;

  // Draw gradient overlay if requested (for slices view)
  if (withGradient) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0a0f1a");
    gradient.addColorStop(0.5, "#12101f");
    gradient.addColorStop(1, "#0b1018");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  const backgroundTileCache = getBackgroundTileCache();

  if (backgroundTileCache) {
    const tileSize = 1024;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);

    if (tileOpacity < 1.0) {
      ctx.save();
      ctx.globalAlpha = tileOpacity;
    }

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        ctx.drawImage(
          backgroundTileCache,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
        );
      }
    }

    if (tileOpacity < 1.0) {
      ctx.restore();
    }
  } else {
    ctx.fillStyle = TILE_COLORS.BACKGROUND;
    ctx.fillRect(0, 0, width, height);
  }
}

export interface BrandingOptions {
  /** URL text to display (if not provided, no URL is drawn) */
  urlText?: string;
  /** URL position: 'bottom-right' or 'inline' (default: 'bottom-right') */
  urlPosition?: "bottom-right" | "inline";
  /** Logo X position (default: 12) */
  logoX?: number;
  /** Logo Y position (default: 12) */
  logoY?: number;
}

/**
 * Draw branding (logo and optional URL text)
 */
export function drawBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: BrandingOptions = {},
): void {
  const {
    urlText,
    urlPosition = "bottom-right",
    logoX: logoXOption = 12,
    logoY: logoYOption = 12,
  } = options;

  const logoCache = getLogoCache();

  // Draw logo at top left
  if (logoCache) {
    const logoSize = 70;
    const logoX = logoXOption;
    const logoY = logoYOption;
    ctx.drawImage(logoCache, logoX, logoY, logoSize, logoSize);

    ctx.font = "bold 42px Orbitron, sans-serif";
    ctx.fillStyle = "#BEABF0";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("TI4 Lab", logoX + logoSize + 12, logoY + logoSize / 2);

    // Draw URL inline with logo (for slices view)
    if (urlText && urlPosition === "inline") {
      // Draw vertical separator
      const separatorX = logoX + logoSize + 220;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(separatorX, logoY + 15);
      ctx.lineTo(separatorX, logoY + logoSize - 15);
      ctx.stroke();

      // Draw URL in the same row
      ctx.font = "28px Quantico, sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(urlText, separatorX + 30, logoY + logoSize / 2);
    }
  }

  // Draw URL at bottom right (for map views)
  if (urlText && urlPosition === "bottom-right") {
    ctx.font = "24px Quantico, sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(urlText, width - 12, height - 12);
  }
}

/**
 * Draw a map onto the canvas
 */
export function drawMap(
  ctx: CanvasRenderingContext2D,
  map: Map,
  hydratedPlayers: HydratedPlayer[],
  dimensions: CanvasDimensions,
): void {
  map
    .filter((t) => !!t.position)
    .forEach((tile) => {
      drawHexTile(
        ctx,
        tile,
        hydratedPlayers,
        dimensions.radius,
        dimensions.gap,
        dimensions.hOffset,
        dimensions.wOffset,
      );
    });
}

/**
 * Create a canvas and context with initialization
 */
export function createCanvas(width: number, height: number): {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d") as any as CanvasRenderingContext2D;
  return { canvas, ctx };
}

/**
 * Save canvas context, execute callback, then restore context
 */
export function withContext(
  ctx: CanvasRenderingContext2D,
  callback: () => void,
): void {
  ctx.save();
  try {
    callback();
  } finally {
    ctx.restore();
  }
}

/**
 * Draw an image rotated by a specified angle (in degrees)
 */
export function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  image: any,
  x: number,
  y: number,
  size: number,
  rotationDegrees: number,
): void {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((rotationDegrees * Math.PI) / 180);
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
}

/**
 * Measure text and truncate if necessary to fit within maxWidth
 */
export function measureAndTruncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  fontFamily: string,
): { displayText: string; fontSize: number; width: number } {
  let fontSize = maxFontSize;
  let displayText = text;
  let width = 0;

  // Try decreasing font size until text fits
  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    width = ctx.measureText(displayText).width;

    if (width <= maxWidth) {
      break;
    }

    // If still too wide, try truncating text
    if (fontSize === minFontSize) {
      // Truncate text with ellipsis
      let truncated = text;
      while (truncated.length > 0) {
        truncated = truncated.slice(0, -1);
        const testText = truncated + "...";
        ctx.font = `${fontSize}px ${fontFamily}`;
        const testWidth = ctx.measureText(testText).width;
        if (testWidth <= maxWidth) {
          displayText = testText;
          width = testWidth;
          break;
        }
      }
      break;
    }

    fontSize -= 1;
  }

  // Ensure we don't go below minFontSize
  if (fontSize < minFontSize) {
    fontSize = minFontSize;
    ctx.font = `${fontSize}px ${fontFamily}`;
    width = ctx.measureText(displayText).width;
  }

  return { displayText, fontSize, width };
}

/**
 * Draw a rounded rectangle
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string,
): void {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
