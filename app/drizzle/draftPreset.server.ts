import { v4 as uuidv4 } from "uuid";
import { desc, eq } from "drizzle-orm";
import { db } from "./config.server";
import { draftPresets } from "./schema.server";
import {
  Draft,
  DraftSettings,
  FactionId,
  FactionReferenceCardPack,
  Map,
  Slice,
} from "~/types";

/** The subset of a draft that is persisted in a preset. */
export type DraftPresetData = {
  settings: DraftSettings;
  slices: Slice[];
  presetMap: Map;
  availableFactions: FactionId[];
  availableMinorFactions?: FactionId[];
  availableReferenceCardPacks?: FactionReferenceCardPack[];
};

export type DraftPreset = {
  id: string;
  name: string;
  data: DraftPresetData;
  keepFactions: boolean;
  playerCount: number;
  createdAt: string;
  updatedAt: string;
};

export function draftToPresetData(
  draft: Pick<
    Draft,
    | "settings"
    | "slices"
    | "presetMap"
    | "availableFactions"
    | "availableMinorFactions"
    | "availableReferenceCardPacks"
  >,
): DraftPresetData {
  return {
    settings: draft.settings,
    slices: draft.slices,
    presetMap: draft.presetMap,
    availableFactions: draft.availableFactions,
    availableMinorFactions: draft.availableMinorFactions,
    availableReferenceCardPacks: draft.availableReferenceCardPacks,
  };
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
    updatedAt: row.updatedAt,
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

export async function findDraftPresets(): Promise<DraftPreset[]> {
  const rows = await db
    .select()
    .from(draftPresets)
    .orderBy(desc(draftPresets.createdAt));
  return rows.map(rowToPreset);
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
      id: uuidv4().toString(),
      name: input.name,
      data: JSON.stringify(input.data),
      keepFactions: input.keepFactions,
      playerCount: input.playerCount,
    })
    .returning()
    .all();
  return rowToPreset(rows[0]);
}
