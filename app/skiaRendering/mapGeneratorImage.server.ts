import {
  initializeFonts,
  loadAllAssets,
} from "./cache.server";
import {
  calculateCanvasDimensions,
  drawBackground,
  drawBranding,
  drawMap,
  createCanvas,
} from "./canvasUtils.server";
import { Map, ClosedTile } from "~/types";

/**
 * Generate a map image buffer from a decoded map
 */
export async function generateMapGeneratorImageBuffer(
  map: Map,
  closedTiles: number[] = [],
): Promise<Buffer> {
  // Initialize fonts and load all assets
  initializeFonts();
  await loadAllAssets();

  // Convert closedTiles indices to CLOSED tile types for rendering
  const renderMap: Map = map.map((tile, idx) => {
    if (closedTiles.includes(idx)) {
      const closedTile: ClosedTile = {
        idx: tile.idx,
        type: "CLOSED",
        position: tile.position,
      };
      return closedTile;
    }
    return tile;
  });

  // Calculate canvas dimensions based on map size
  const dimensions = calculateCanvasDimensions(renderMap);
  const { canvas, ctx } = createCanvas(dimensions.width, dimensions.height);

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, renderMap, [], dimensions);
  drawBranding(ctx, dimensions.width, dimensions.height, {
    urlText: "tidraft.com/map-generator",
  });

  // Return PNG buffer
  return await canvas.toBuffer("png");
}

export async function generateMapPreviewImageBuffer(
  map: Map,
  closedTiles: number[] = [],
  options: { scale?: number; withBranding?: boolean; urlText?: string } = {},
): Promise<Buffer> {
  initializeFonts();
  await loadAllAssets();

  const renderMap: Map = map.map((tile, idx) => {
    if (closedTiles.includes(idx)) {
      const closedTile: ClosedTile = {
        idx: tile.idx,
        type: "CLOSED",
        position: tile.position,
      };
      return closedTile;
    }
    return tile;
  });

  const baseDimensions = calculateCanvasDimensions(renderMap);
  const scale = options.scale ?? 0.6;
  const dimensions = {
    ...baseDimensions,
    width: Math.round(baseDimensions.width * scale),
    height: Math.round(baseDimensions.height * scale),
    radius: baseDimensions.radius * scale,
    gap: baseDimensions.gap * scale,
    hOffset: baseDimensions.hOffset * scale,
    wOffset: baseDimensions.wOffset * scale,
  };

  const { canvas, ctx } = createCanvas(dimensions.width, dimensions.height);

  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, renderMap, [], dimensions);

  if (options.withBranding) {
    drawBranding(ctx, dimensions.width, dimensions.height, {
      urlText: options.urlText,
    });
  }

  return await canvas.toBuffer("png");
}
