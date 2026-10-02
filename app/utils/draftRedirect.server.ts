import { redirect } from "react-router";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
  updateDraftUrl,
} from "~/drizzle/draft.server";
import { Draft } from "~/types";

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

/**
 * Loads a draft by its pretty url, redirecting legacy UUID urls (to the same
 * page, via `suffix`) and throwing a 404 if it doesn't exist.
 */
export async function loadDraftByUrlParam(urlParam: string, suffix = "") {
  if (validateUUID(urlParam)) {
    throw await redirectToPrettyDraftUrl(urlParam, suffix);
  }

  const result = await draftByPrettyUrl(urlParam);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  return { ...result, data: JSON.parse(result.data as string) as Draft };
}
