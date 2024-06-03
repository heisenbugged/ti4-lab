import { desc, eq } from "drizzle-orm";
import { db } from "./config.server";
import { drafts } from "./schema.server";
import { generatePrettyUrlName } from "~/data/urlWords.server";

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

    // TODO: This has a race condition where two drafts could be created with the same pretty url
    // (extremely unlikely given current traffic)
    console.log("pretty url candidate is", prettyUrl);
    const existingRecord = await draftByPrettyUrl(prettyUrl);
    exists = !!existingRecord;
    console.log("candidate already exists?", exists);
  }
  return prettyUrl;
}
