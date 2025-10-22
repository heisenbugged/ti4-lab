import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { generateDraftImageBuffer } from "~/skiaRendering/imageGenerator.server";
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

  // Redirect to draft page if not complete
  if (!isComplete) {
    return redirect(`/draft/${draftId}`, { status: 302 });
  }

  // Production mode: if image already exists in CDN, redirect to it
  if (!devMode && result.imageUrl) {
    return redirect(result.imageUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Generate image
  const imageBuffer = await generateDraftImageBuffer(draft, draftId);

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
  const cdnUrl = await syncImageToR2(draftId, imageBuffer);

  // Save CDN URL to database
  await db
    .update(drafts)
    .set({ imageUrl: cdnUrl })
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
