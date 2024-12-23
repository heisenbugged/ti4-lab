import { eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { findDrafts } from "~/drizzle/draft.server";
import { drafts } from "~/drizzle/schema.server";
import { Draft, SystemId } from "~/types";

async function migrateState() {
  const records = await findDrafts();
  records.forEach(async (draft) => {
    const rawData = JSON.parse(draft.data as string) as Draft;
    rawData.slices = rawData.slices.map((slice) => ({
      ...slice,
      tiles: slice.tiles.map((tile) => {
        if (tile.type === "SYSTEM") {
          console.log("The tile system id is", tile.systemId);
          return {
            ...tile,
            systemId: getFixedSystemId(tile.systemId),
          };
        } else {
          return tile;
        }
      }),
    }));

    await db
      .update(drafts)
      .set({ data: JSON.stringify(rawData) })
      .where(eq(drafts.id, draft.id));
  });
}

const getFixedSystemId = (systemId?: SystemId) => {
  if (!systemId) return undefined;

  // Special case for 4224
  if (systemId === "4224") return "44";
  if (systemId === "4225") return "77";

  // Handle the sequence from 4228 to 4236
  const mappings: Record<string, string> = {
    "4228": "4225",
    "4229": "4226",
    "4230": "4227",
    "4231": "4228",
    "4232": "4229",
    "4233": "4230",
    "4234": "4231",
    "4235": "4232",
    "4236": "4233",
  };

  if (systemId in mappings) {
    return mappings[systemId];
  }

  // Handle 4237 or greater
  const numId = parseInt(systemId);
  if (numId >= 4237) {
    return (numId + 16).toString();
  }

  return systemId;
};
(async () => {
  await migrateState();
  console.log("done");
})();
