import { LoaderFunctionArgs, redirect } from "react-router";
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const draftId = params.draftId;
  if (!draftId) {
    throw new Response("Draft ID required", { status: 400 });
  }

  const url = new URL(request.url);
  const devMode = url.searchParams.get("dev") === "true";

  console.log("draftId", draftId);
  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  // Check if draft is complete
  const draft = JSON.parse(result.data as string) as Draft;
  const isComplete = draft.selections?.length === draft.pickOrder?.length;

  // Production mode: if image already exists in CDN, redirect to it
  const existingImageUrl = isComplete ? result.imageUrl : result.incompleteImageUrl;
  if (!devMode && existingImageUrl) {
    return redirect(existingImageUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Generate appropriate image based on completion status
  const imageBuffer = isComplete
    ? await generateDraftImageBuffer(draft, draftId)
    : draft.settings.draftGameMode === "presetMap"
      ? await generatePresetDraftImage(draft, draftId)
      : await generateDraftSlicesImage(draft, draftId);

  // Dev mode: return image directly
  if (devMode) {
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
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
  return redirect(cdnUrl, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
