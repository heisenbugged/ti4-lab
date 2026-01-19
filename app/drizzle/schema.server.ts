import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  blob,
  index,
  integer,
  unique,
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
