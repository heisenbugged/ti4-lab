import { db } from "../app/drizzle/config.server";
import { drafts } from "../app/drizzle/schema.server";
import { Draft } from "../app/types";
import { eq } from "drizzle-orm";

async function backfillDraftMetadata() {
  console.log("Starting backfill of draft metadata...");

  const allDrafts = await db.select().from(drafts).all();
  console.log(`Found ${allDrafts.length} drafts to process`);

  let updated = 0;
  for (const draft of allDrafts) {
    try {
      const draftData = JSON.parse(draft.data as string) as Draft;
      const type = draftData.settings?.type || null;
      const isComplete =
        draftData.selections?.length === draftData.pickOrder?.length ? 1 : 0;

      await db
        .update(drafts)
        .set({ type, isComplete })
        .where(eq(drafts.id, draft.id))
        .run();

      updated++;
      if (updated % 100 === 0) {
        console.log(`Processed ${updated} drafts...`);
      }
    } catch (error) {
      console.error(`Error processing draft ${draft.id}:`, error);
    }
  }

  console.log(`Backfill complete. Updated ${updated} drafts.`);
}

backfillDraftMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
