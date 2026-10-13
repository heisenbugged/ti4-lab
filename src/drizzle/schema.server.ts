import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  blob,
  index,
  integer,
  unique,
  real,
  primaryKey,
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
    // Drafts started on this map, matched by layout (see presetFingerprint)
    draftCount: integer("draftCount").notNull().default(0),
    // Kept reachable by URL but left out of the community listing
    hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
    // Pool for the map-of-the-day spotlight
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
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
 * One row per viewer per map per day, so reloads, revalidations and repeat
 * visits only count once. Rows older than a couple of days are pruned.
 */
export const presetMapViews = sqliteTable(
  "presetMapViews",
  {
    day: text("day").notNull(),
    presetMapId: text("presetMapId").notNull(),
    viewer: text("viewer").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.day, table.presetMapId, table.viewer] }),
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

/** People who signed in with Discord. `id` is the Discord user id. */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  globalName: text("globalName"),
  avatar: text("avatar"),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("lastSeenAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * A group's public page of drafts and slice sets. Each Discord account owns
 * one; anyone with the link can view it, only the owner can edit it.
 */
export const hubs = sqliteTable(
  "hubs",
  {
    id: text("id").primaryKey(),
    ownerId: text("ownerId")
      .notNull()
      .unique()
      .references(() => users.id),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    slugIdx: index("hubs_slug_index").on(table.slug),
  }),
);

/** Drafts on a hub: created while signed in, started by the bot, or imported. */
export const hubDrafts = sqliteTable(
  "hubDrafts",
  {
    hubId: text("hubId")
      .notNull()
      .references(() => hubs.id),
    draftId: text("draftId")
      .notNull()
      .references(() => drafts.id),
    /** "created" | "discord" | "imported" */
    source: text("source").notNull(),
    label: text("label"),
    archivedAt: text("archivedAt"),
    addedAt: text("addedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.hubId, table.draftId] }),
    draftIdx: index("hub_drafts_draft_id_index").on(table.draftId),
  }),
);

/** Named slice sets on a hub. Each one is a draft preset, so the bot can start it too. */
export const hubSliceSets = sqliteTable(
  "hubSliceSets",
  {
    id: text("id").primaryKey(),
    hubId: text("hubId")
      .notNull()
      .references(() => hubs.id),
    presetId: text("presetId")
      .notNull()
      .references(() => draftPresets.id),
    title: text("title").notNull(),
    archivedAt: text("archivedAt"),
    addedAt: text("addedAt")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    hubPresetUnique: unique("hub_slice_sets_hub_preset_unique").on(
      table.hubId,
      table.presetId,
    ),
    hubIdx: index("hub_slice_sets_hub_id_index").on(table.hubId),
  }),
);
