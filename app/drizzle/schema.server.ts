import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  blob,
  index,
  integer,
  unique,
  real,
} from "drizzle-orm/sqlite-core";

// Define a function to generate UUIDs for default values
export const drafts = sqliteTable(
  "drafts",
  {
    id: text("id").primaryKey(),
    urlName: text("urlName"),
    data: blob("data").notNull(),
    type: text("type"),
    isComplete: integer("isComplete", { mode: "boolean" }),
    mode: text("mode"),
    phase: text("phase"),
    selectionsCount: integer("selectionsCount"),
    pickOrderCount: integer("pickOrderCount"),
    progressPercent: real("progressPercent"),
    playerCount: integer("playerCount"),
    playerNames: text("playerNames"),
    playerNamesSearch: text("playerNamesSearch"),
    imageUrl: text("imageUrl"),
    incompleteImageUrl: text("incompleteImageUrl"),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    urlNameIdx: index("urlName_index").on(table.urlName),
    typeIdx: index("type_index").on(table.type),
    isCompleteIdx: index("isComplete_index").on(table.isComplete),
    modeIdx: index("drafts_mode_index").on(table.mode),
    phaseIdx: index("drafts_phase_index").on(table.phase),
    playerCountIdx: index("drafts_player_count_index").on(table.playerCount),
    modeCompleteUpdatedIdx: index("drafts_mode_complete_updated_index").on(
      table.mode,
      table.isComplete,
      table.updatedAt,
    ),
    phaseCompleteUpdatedIdx: index("drafts_phase_complete_updated_index").on(
      table.phase,
      table.isComplete,
      table.updatedAt,
    ),
  }),
);

export const draftDiscordMessages = sqliteTable(
  "draftDiscordMessages",
  {
    messageId: text("messageId").primaryKey(),
    draftId: text("draftId")
      .notNull()
      .references(() => drafts.id),
    pick: integer("pick").notNull(),
  },
  (table) => ({
    draftIdIdx: index("draft_discord_messages_draft_id_index").on(
      table.draftId,
    ),
    draftIdPickUnique: unique("draft_id_pick_unique").on(
      table.draftId,
      table.pick,
    ),
  }),
);

export const draftStagedSelections = sqliteTable(
  "draftStagedSelections",
  {
    id: text("id").primaryKey(),
    draftId: text("draftId")
      .notNull()
      .references(() => drafts.id),
    phase: text("phase").notNull(),
    playerId: integer("playerId").notNull(),
    value: text("value").notNull(),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    draftIdIdx: index("draft_staged_selections_draft_id_index").on(
      table.draftId,
    ),
    draftPhaseIdx: index("draft_staged_selections_phase_index").on(
      table.draftId,
      table.phase,
    ),
    draftPhasePlayerUnique: unique("draft_phase_player_unique").on(
      table.draftId,
      table.phase,
      table.playerId,
    ),
  }),
);

export const multiDrafts = sqliteTable(
  "multiDrafts",
  {
    id: text("id").primaryKey(),
    urlName: text("urlName"),
    draftUrlNames: text("draftUrlNames"),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    urlNameIdx: index("multiDrafts_urlName_index").on(table.urlName),
  }),
);

export const soundboardSession = sqliteTable("soundboardSession", {
  id: text("id").primaryKey(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const presetMaps = sqliteTable(
  "presetMaps",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    author: text("author").notNull(),
    mapString: text("mapString").notNull(),
    mapConfigId: text("mapConfigId").notNull(),
    imageUrl: text("imageUrl"),
    likes: integer("likes").notNull().default(0),
    views: integer("views").notNull().default(0),
    avgSliceValue: real("avgSliceValue"),
    totalResources: integer("totalResources"),
    totalInfluence: integer("totalInfluence"),
    legendaries: integer("legendaries"),
    techSkips: text("techSkips"), // JSON: {"G":2,"R":1,"B":3,"Y":1}
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    slugIdx: index("preset_maps_slug_index").on(table.slug),
    nameIdx: index("preset_maps_name_index").on(table.name),
    createdAtIdx: index("preset_maps_created_at_index").on(table.createdAt),
  }),
);

export const presetMapLikes = sqliteTable(
  "presetMapLikes",
  {
    id: text("id").primaryKey(),
    presetMapId: text("presetMapId").notNull(),
    ip: text("ip").notNull(),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    presetMapIdIdx: index("preset_map_likes_preset_map_id_index").on(
      table.presetMapId,
    ),
    presetMapIpUnique: unique("preset_map_likes_unique").on(
      table.presetMapId,
      table.ip,
    ),
  }),
);

/**
 * Saved draft configurations that can be used to start new drafts
 * (e.g. via the discord `/labdraft preset:<name>` command).
 */
export const draftPresets = sqliteTable("draftPresets", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  /** JSON-encoded DraftPresetData */
  data: text("data").notNull(),
  keepFactions: integer("keepFactions", { mode: "boolean" })
    .notNull()
    .default(true),
  playerCount: integer("playerCount").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
