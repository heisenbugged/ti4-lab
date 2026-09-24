import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "./config.server";
import { draftPresets } from "./schema.server";
import { Draft } from "~/types";

const DRAFT_PRESET_KEYS = [
  "settings",
  "slices",
  "presetMap",
  "availableFactions",
  "availableMinorFactions",
  "availableReferenceCardPacks",
] as const;

/** The subset of a draft that is persisted in a preset. */
export type DraftPresetData = Pick<Draft, (typeof DRAFT_PRESET_KEYS)[number]>;

export type DraftPreset = {
  id: string;
  name: string;
  data: DraftPresetData;
  keepFactions: boolean;
  playerCount: number;
  createdAt: string;
};

export function draftToPresetData(draft: DraftPresetData): DraftPresetData {
  return Object.fromEntries(
    DRAFT_PRESET_KEYS.map((key) => [key, draft[key]]),
  ) as DraftPresetData;
}

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

export async function createDraftPreset(input: {
  name: string;
  keepFactions: boolean;
  playerCount: number;
  data: DraftPresetData;
}): Promise<DraftPreset> {
  const rows = db
    .insert(draftPresets)
    .values({
      id: uuidv4(),
      name: input.name,
      data: JSON.stringify(input.data),
      keepFactions: input.keepFactions,
      playerCount: input.playerCount,
    })
    .returning()
    .all();
  return rowToPreset(rows[0]);
}
