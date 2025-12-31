import { eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { findDrafts } from "~/drizzle/draft.server";
import { drafts } from "~/drizzle/schema.server";

async function migrateState() {
  let deletedCount = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await findDrafts({ page, pageSize: 100 });

    for (const draft of result.drafts) {
      // Delete drafts with miltyeqless or wekker draft types
      if (draft.data.settings.type === "miltyeqless" || draft.data.settings.type === "wekker") {
        await db.delete(drafts).where(eq(drafts.id, draft.id));
        deletedCount++;
        console.log(`Deleted draft ${draft.id} with type ${draft.data.settings.type}`);
      }
    }

    hasMore = page < result.totalPages;
    page++;
  }

  console.log(`Deleted ${deletedCount} drafts total`);
}

(async () => {
  await migrateState();
  console.log("done");
})();
