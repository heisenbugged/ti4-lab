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
import { Map } from "~/types";

/**
 * Generate a map image buffer from a decoded map
 */
export async function generateMapGeneratorImageBuffer(
  map: Map,
): Promise<Buffer> {
  // Initialize fonts and load all assets
  initializeFonts();
  await loadAllAssets();

  // Calculate canvas dimensions based on map size
  const dimensions = calculateCanvasDimensions(map);
  const { canvas, ctx } = createCanvas(dimensions.width, dimensions.height);

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, map, [], dimensions);
  drawBranding(ctx, dimensions.width, dimensions.height, {
    urlText: "tidraft.com/map-generator",
  });

  // Return PNG buffer
  return await canvas.toBuffer("png");
}
