import { eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { findDrafts } from "~/drizzle/draft.server";
import { drafts } from "~/drizzle/schema.server";
import { Draft } from "~/types";

async function migrateState() {
  const records = await findDrafts();
  records.forEach(async (draft) => {
    const rawData = JSON.parse(draft.data as string) as Draft;
    if (rawData.settings.gameSets !== undefined) {
      rawData.settings.factionGameSets = rawData.settings.gameSets;
      rawData.settings.tileGameSets = rawData.settings.gameSets;
      delete rawData.settings.gameSets;
    }

    await db
      .update(drafts)
      .set({ data: JSON.stringify(rawData) })
      .where(eq(drafts.id, draft.id));
  });
}

(async () => {
  await migrateState();
  console.log("done");
})();
