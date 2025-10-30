import { Canvas } from "skia-canvas";
import { Map } from "~/types";
import {
  calculateConcentricCircles,
  calcHexHeight,
} from "~/utils/positioning";
import {
  initializeFonts,
  loadAllAssets,
  getBackgroundTileCache,
  getLogoCache,
} from "./cache.server";
import { TILE_COLORS } from "./constants";
import { drawHexTile } from "./renderers/hexRenderer.server";
import { mapConfigs, generateMapFromConfig } from "~/mapgen/mapConfigs";
import { systemData } from "~/data/systemData";

/**
 * Generate a map image buffer from map generator parameters
 */
export async function generateMapGeneratorImageBuffer(
  mapSystemIds: string[],
  mapConfigId: string,
): Promise<Buffer> {
  // Initialize fonts and load all assets
  initializeFonts();
  await loadAllAssets();

  // Get map config
  const config = mapConfigs[mapConfigId] || mapConfigs["milty6p"];

  // Generate the map from config
  const map = generateMapFromConfig(config);

  // Apply systems from parameters
  let tileIndex = 0;
  mapSystemIds.forEach((systemId) => {
    // Find next available OPEN tile (skip Mecatol Rex at index 0)
    while (
      tileIndex < map.length &&
      (map[tileIndex].type !== "OPEN" || tileIndex === 0)
    ) {
      tileIndex++;
    }

    if (tileIndex < map.length && systemData[systemId as any]) {
      map[tileIndex] = {
        ...map[tileIndex],
        type: "SYSTEM",
        systemId: systemId as any,
      };
      tileIndex++;
    }
  });

  // Calculate canvas dimensions based on map size
  const dimensions = calculateCanvasDimensions(map);
  const canvas = new Canvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext("2d") as any as CanvasRenderingContext2D;

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, map, [], dimensions);
  drawBranding(ctx, dimensions.width, dimensions.height);

  // Return PNG buffer
  return await canvas.toBuffer("png");
}

interface CanvasDimensions {
  width: number;
  height: number;
  radius: number;
  gap: number;
  hOffset: number;
  wOffset: number;
}

function calculateCanvasDimensions(map: Map): CanvasDimensions {
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

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const backgroundTileCache = getBackgroundTileCache();

  if (backgroundTileCache) {
    const tileSize = 1024;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);

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
  } else {
    ctx.fillStyle = TILE_COLORS.BACKGROUND;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  map: Map,
  hydratedPlayers: any[],
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

function drawBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const logoCache = getLogoCache();

  // Draw logo at top left
  if (logoCache) {
    const logoSize = 70;
    const logoX = 12;
    const logoY = 12;
    ctx.drawImage(logoCache, logoX, logoY, logoSize, logoSize);

    ctx.font = "bold 42px Orbitron, sans-serif";
    ctx.fillStyle = "#BEABF0";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("TI4 Lab", logoX + logoSize + 12, logoY + logoSize / 2);
  }

  // Draw map generator URL at bottom right
  const mapUrl = "tidraft.com/map-generator";
  ctx.font = "24px Quantico, sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(mapUrl, width - 12, height - 12);
}
