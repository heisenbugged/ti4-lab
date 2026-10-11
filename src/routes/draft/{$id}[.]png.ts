import { createFileRoute } from "@tanstack/react-router";
import { pngResponse, redirectToImage } from "~/utils/imageResponse.server";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { generateDraftImageBuffer } from "~/skiaRendering/imageGenerator.server";
import {
  generateDraftSlicesImage,
  generatePresetDraftImage,
} from "~/skiaRendering/slicesImageGenerator.server";
import { syncImageToR2 } from "~/utils/syncImageToR2.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/draft/{$id}.png")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const draftId = params.id;
        if (!draftId) {
          return new Response("Draft ID required", { status: 400 });
        }

        const url = new URL(request.url);
        const devMode = url.searchParams.get("dev") === "true";

        const result = await draftByPrettyUrl(draftId);
        if (!result) {
          return new Response("Draft not found", { status: 404 });
        }

        // Check if draft is complete
        const draft = JSON.parse(result.data as string) as Draft;
        const isComplete = draft.selections?.length === draft.pickOrder?.length;

        // Production mode: if image already exists in CDN, redirect to it
        const existingImageUrl = isComplete
          ? result.imageUrl
          : result.incompleteImageUrl;
        if (!devMode && existingImageUrl) {
          return redirectToImage(existingImageUrl);
        }

        // Generate appropriate image based on completion status
        const imageBuffer = isComplete
          ? await generateDraftImageBuffer(draft, draftId)
          : draft.settings.draftGameMode === "presetMap"
            ? await generatePresetDraftImage(draft, draftId)
            : await generateDraftSlicesImage(draft, draftId);

        // Dev mode: return image directly
        if (devMode) {
          return pngResponse(imageBuffer, "no-cache");
        }

        // Upload to R2
        const status = isComplete ? "complete" : "incomplete";
        const cdnUrl = await syncImageToR2(draftId, imageBuffer, status);

        // Save CDN URL to database
        const updateData = isComplete
          ? { imageUrl: cdnUrl }
          : { incompleteImageUrl: cdnUrl };

        await db
          .update(drafts)
          .set(updateData)
          .where(eq(drafts.urlName, draftId))
          .run();

        // Redirect to CDN URL
        return redirectToImage(cdnUrl);
      },
    },
  },
});
