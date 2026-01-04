import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "./config.server";
import { drafts } from "./schema.server";
import { RawDraftState } from "~/rawDraftStore";
import {
  generateUniquePrettyUrl,
  draftByPrettyUrl,
  updateDraftUrl,
} from "./draft.server";
import { enqueueImageJob } from "~/utils/imageJobQueue.server";

export async function createRawDraft(draft: RawDraftState, presetUrl?: string) {
  const id = uuidv4().toString();
  const prettyUrl = await getPrettyUrl(presetUrl);
  const type = "raw";
  const isComplete = draft.events.length === draft.pickOrder.length;

  db.insert(drafts)
    .values({
      id,
      urlName: prettyUrl,
      data: JSON.stringify(draft),
      type,
      isComplete,
    })
    .run();

  // Enqueue incomplete image generation
  enqueueImageJob(id, prettyUrl, false);

  return { id, prettyUrl };
}

async function getPrettyUrl(presetUrl?: string): Promise<string> {
  if (!presetUrl) return generateUniquePrettyUrl();

  // if the presetUrl is already taken, generate a new one
  // and update the old draft with the new url.
  const existingRecord = await draftByPrettyUrl(presetUrl);
  if (existingRecord) {
    const newUrl = await generateUniquePrettyUrl();
    await updateDraftUrl(existingRecord.id, newUrl);
  }

  return presetUrl;
}

export async function updateRawDraft(id: string, draftData: RawDraftState) {
  const type = "raw";
  const newIsComplete = draftData.events.length === draftData.pickOrder.length;

  db.update(drafts)
    .set({
      data: JSON.stringify(draftData),
      type,
      isComplete: newIsComplete,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(drafts.id, id))
    .run();
}
