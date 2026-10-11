import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "./config.server";
import { draftPresets } from "./schema.server";
import type { DraftPresetData } from "~/utils/draftPreset";

export type DraftPreset = {
  id: string;
  name: string;
  data: DraftPresetData;
  keepFactions: boolean;
  playerCount: number;
  createdAt: string;
};

type Row = typeof draftPresets.$inferSelect;

function rowToPreset(row: Row): DraftPreset {
  return {
    id: row.id,
    name: row.name,
    data: JSON.parse(row.data) as DraftPresetData,
    keepFactions: row.keepFactions,
    playerCount: row.playerCount,
    createdAt: row.createdAt,
  };
}

export async function draftPresetByName(
  name: string,
): Promise<DraftPreset | undefined> {
  const rows = await db
    .select()
    .from(draftPresets)
    .where(eq(draftPresets.name, name))
    .limit(1);
  return rows[0] ? rowToPreset(rows[0]) : undefined;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

/** Returns undefined when a preset with the same name already exists. */
export async function createDraftPreset(input: {
  name: string;
  keepFactions: boolean;
  playerCount: number;
  data: DraftPresetData;
}): Promise<DraftPreset | undefined> {
  try {
    const rows = await db
      .insert(draftPresets)
      .values({
        id: uuidv4(),
        name: input.name,
        data: JSON.stringify(input.data),
        keepFactions: input.keepFactions,
        playerCount: input.playerCount,
      })
      .returning();
    return rowToPreset(rows[0]);
  } catch (error) {
    if (isUniqueConstraintError(error)) return undefined;
    throw error;
  }
}
