import { eq } from "drizzle-orm";
import { deriveDraftMetadata } from "../src/drizzle/draft.server";
import { db } from "../src/drizzle/config.server";
import { drafts } from "../src/drizzle/schema.server";
import { Draft } from "../src/types";

async function backfillDraftAdminMetadata() {
  console.log("Starting draft admin metadata backfill...");

  const allDrafts = await db.select().from(drafts).all();
  console.log(`Found ${allDrafts.length} drafts to process`);

  let updated = 0;
  let failed = 0;

  for (const draft of allDrafts) {
    try {
      const draftData = JSON.parse(draft.data as string) as Draft;
      const metadata = deriveDraftMetadata(draftData);

      await db
        .update(drafts)
        .set(metadata)
        .where(eq(drafts.id, draft.id))
        .run();

      updated++;
      if (updated % 100 === 0) {
        console.log(`Processed ${updated} drafts...`);
      }
    } catch (error) {
      failed++;
      console.error(`Error processing draft ${draft.id}:`, error);
    }
  }

  console.log(
    `Draft admin metadata backfill complete. Updated ${updated}, failed ${failed}.`,
  );
}

backfillDraftAdminMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
