import { v4 as uuidv4 } from "uuid";
import { desc, eq } from "drizzle-orm";
import { db } from "./config.server";
import { drafts } from "./schema.server";
import { generatePrettyUrlName } from "~/data/urlWords.server";
import { Draft } from "~/types";

export async function draftById(id: string) {
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, id))
    .limit(1);

  return results[0];
}

export async function findDrafts() {
  return db.select().from(drafts).orderBy(desc(drafts.createdAt));
}

export async function draftByPrettyUrl(urlName: string) {
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.urlName, urlName))
    .limit(1);

  return results[0];
}

export async function generateUniquePrettyUrl() {
  let exists = true;
  let prettyUrl = "";
  while (exists) {
    prettyUrl = generatePrettyUrlName();
    const existingRecord = await draftByPrettyUrl(prettyUrl);
    exists = !!existingRecord;
  }
  return prettyUrl;
}

export async function createDraft(draft: Draft, presetUrl?: string) {
  const id = uuidv4().toString();
  const prettyUrl = await getPrettyUrl(presetUrl);
  db.insert(drafts)
    .values({
      id,
      urlName: prettyUrl,
      data: JSON.stringify(draft),
    })
    .run();

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

export async function updateDraftUrl(id: string, urlName: string) {
  db.update(drafts).set({ urlName }).where(eq(drafts.id, id)).run();
}

export async function updateDraft(id: string, draftData: Draft) {
  db.update(drafts)
    .set({ data: JSON.stringify(draftData) })
    .where(eq(drafts.id, id))
    .run();
}
