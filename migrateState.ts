import { eq } from "drizzle-orm";
import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "~/draft";
import { db } from "~/drizzle/config.server";
import { findDrafts } from "~/drizzle/draft.server";
import { drafts } from "~/drizzle/schema.server";
import { DiscordData, Draft, DraftSelection, Slice, Tile } from "~/types";

async function migrateState() {
  const records = await findDrafts();
  records.forEach(async (draft) => {
    //

    // parce updated-at as utc string
    const updatedAt = new Date(draft.updatedAt);
    // calculate how many days ago updatedAt is
    const daysAgo = Math.floor(
      (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    console.log("daysago", daysAgo);
    if (daysAgo > 2) {
      const rawData = JSON.parse(draft.data as string) as Draft;
      const doesNotMatch = rawData.players.some(
        (player, idx) => player.name !== `Player ${idx + 1}`,
      );
      if (doesNotMatch) {
        return;
      }

      console.log("we are deleting this mock draft");
      console.log(rawData.players.map((player) => player.name).join(" "));

      await db.delete(drafts).where(eq(drafts.id, draft.id));
    }
  });
}

(async () => {
  await migrateState();
  console.log("done");
})();
