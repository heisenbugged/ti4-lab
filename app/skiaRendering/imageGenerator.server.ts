import { Canvas } from "skia-canvas";
import { Draft, Map, HydratedPlayer } from "~/types";
import {
  calculateConcentricCircles,
  calcHexHeight,
} from "~/utils/positioning";
import { hydrateMap } from "~/utils/map";
import {
  hydratePlayers,
  computePlayerSelections,
} from "~/hooks/useHydratedDraft";
import { draftConfig } from "~/draft";
import {
  initializeFonts,
  loadAllAssets,
  getBackgroundTileCache,
  getLogoCache,
} from "./cache.server";
import { TILE_COLORS } from "./constants";
import { drawHexTile } from "./renderers/hexRenderer.server";

export async function generateDraftImage(
  draft: Draft,
  draftId: string,
): Promise<string> {
  const pngData = await generateDraftImageBuffer(draft, draftId);
  return `data:image/png;base64,${pngData.toString("base64")}`;
}

export async function generateDraftImageBuffer(
  draft: Draft,
  draftId: string,
): Promise<Buffer> {
  // Initialize fonts and load all assets
  initializeFonts();
  await loadAllAssets();

  // Hydrate the draft
  const hydratedPlayers = hydratePlayers(
    draft.players,
    draft.selections,
    draft.settings.draftSpeaker,
    draft.integrations.discord?.players,
  );

  const hydratedMap = hydrateMap(
    draftConfig[draft.settings.type],
    draft.presetMap,
    draft.slices,
    computePlayerSelections(hydratedPlayers),
  );

  // Calculate canvas dimensions based on map size
  const dimensions = calculateCanvasDimensions(hydratedMap);
  const canvas = new Canvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext("2d");

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, hydratedMap, hydratedPlayers, dimensions);
  drawBranding(ctx, dimensions.width, dimensions.height, draftId);

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

function drawBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  draftId: string,
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

  // Draw draft URL at bottom right
  const draftUrl = `tidraft.com/draft/${draftId}`;
  ctx.font = "24px Quantico, sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(draftUrl, width - 12, height - 12);
}
