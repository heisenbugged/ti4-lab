import { Draft } from "~/types";
import { hydrateMap } from "~/utils/map";
import {
  hydratePlayers,
  computePlayerSelections,
} from "~/hooks/useHydratedDraft";
import { draftConfig } from "~/draft";
import { initializeFonts, loadAllAssets } from "./cache.server";
import {
  calculateCanvasDimensions,
  drawBackground,
  drawBranding,
  drawMap,
  createCanvas,
} from "./canvasUtils.server";
import { getBaseUrl } from "~/env.server";

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
  const { canvas, ctx } = createCanvas(dimensions.width, dimensions.height);

  // Draw all layers
  drawBackground(ctx, dimensions.width, dimensions.height);
  drawMap(ctx, hydratedMap, hydratedPlayers, dimensions);
  const baseUrl = getBaseUrl();
  drawBranding(ctx, dimensions.width, dimensions.height, {
    urlText: `${baseUrl}/draft/${draftId}`,
  });

  // Return PNG buffer
  return await canvas.toBuffer("png");
}
