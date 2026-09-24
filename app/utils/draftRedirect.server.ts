import { redirect } from "react-router";
import {
  draftById,
  generateUniquePrettyUrl,
  updateDraftUrl,
} from "~/drizzle/draft.server";

// Legacy drafts were addressed by UUID; assign a pretty url if needed and redirect to it.
export async function redirectToPrettyDraftUrl(draftId: string, suffix = "") {
  const draft = await draftById(draftId);
  if (!draft) {
    throw new Response("Draft not found", { status: 404 });
  }

  let urlName = draft.urlName;
  if (!urlName) {
    urlName = await generateUniquePrettyUrl();
    await updateDraftUrl(draftId, urlName);
  }

  return redirect(`/draft/${urlName}${suffix}`);
}
