import { notFound, redirect } from "@tanstack/react-router";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
  updateDraftUrl,
} from "~/drizzle/draft.server";
import { Draft } from "~/types";

// Legacy drafts were addressed by UUID; assign a pretty url if needed.
export async function prettyUrlForDraftId(draftId: string) {
  const draft = await draftById(draftId);
  if (!draft) return undefined;

  if (draft.urlName) return draft.urlName;
  const urlName = await generateUniquePrettyUrl();
  await updateDraftUrl(draftId, urlName);
  return urlName;
}

/**
 * Loads a draft by its pretty url, redirecting legacy UUID urls to the same
 * page (`to`) under the pretty url, and throwing not-found if it doesn't exist.
 */
export async function loadDraftByUrlParam(
  urlParam: string,
  to: "/draft/$id" | "/draft/$id/replay" = "/draft/$id",
) {
  if (validateUUID(urlParam)) {
    const id = await prettyUrlForDraftId(urlParam);
    if (!id) throw notFound();
    throw redirect({ to, params: { id } });
  }

  const result = await draftByPrettyUrl(urlParam);
  if (!result) throw notFound();

  return { ...result, data: JSON.parse(result.data as string) as Draft };
}
