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

  const existingRecord = await draftByPrettyUrl(presetUrl);
  return existingRecord ? generateUniquePrettyUrl() : presetUrl;
}

export async function updateDraft(id: string, draftData: Draft) {
  db.update(drafts)
    .set({ data: JSON.stringify(draftData) })
    .where(eq(drafts.id, id))
    .run();
}
