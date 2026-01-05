import { initializeFonts, loadAllAssets } from "./cache.server";
import {
  calculateCanvasDimensions,
  drawBackground,
  drawBranding,
  drawMap,
  createCanvas,
} from "./canvasUtils.server";
import { mapConfigs, generateMapFromConfig } from "~/mapgen/mapConfigs";
import { systemData } from "~/data/systemData";
import { getBaseUrl } from "~/env.server";

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
  const { canvas, ctx } = createCanvas(dimensions.width, dimensions.height);

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, map, [], dimensions);
  const baseUrl = getBaseUrl();
  drawBranding(ctx, dimensions.width, dimensions.height, {
    urlText: `${baseUrl}/map-generator`,
  });

  // Return PNG buffer
  return await canvas.toBuffer("png");
}
