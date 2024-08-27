import { v4 as uuidv4 } from "uuid";
import { desc, eq } from "drizzle-orm";
import { db } from "./config.server";
import { multiDrafts } from "./schema.server";
import { generatePrettyUrlName } from "~/data/urlWords.server";

export async function multiDraftById(id: string) {
  const results = await db
    .select()
    .from(multiDrafts)
    .where(eq(multiDrafts.id, id))
    .limit(1);

  return results[0];
}

export async function findMultiDrafts() {
  return db.select().from(multiDrafts).orderBy(desc(multiDrafts.createdAt));
}

export async function multiDraftByPrettyUrl(urlName: string) {
  const results = await db
    .select()
    .from(multiDrafts)
    .where(eq(multiDrafts.urlName, urlName))
    .limit(1);

  return results[0];
}

export async function generateUniqueMultiDraftPrettyUrl() {
  let exists = true;
  let prettyUrl = "";
  while (exists) {
    prettyUrl = generatePrettyUrlName();
    const existingRecord = await multiDraftByPrettyUrl(prettyUrl);
    exists = !!existingRecord;
  }
  return prettyUrl;
}

export async function createMultiDraft(draftUrlNames: string[]) {
  const urlName = await generateUniqueMultiDraftPrettyUrl();

  await db
    .insert(multiDrafts)
    .values({
      id: uuidv4().toString(),
      urlName,
      draftUrlNames: draftUrlNames.join(","),
    })
    .returning();

  return urlName;
}
