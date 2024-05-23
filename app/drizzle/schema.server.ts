import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const drafts = sqliteTable("drafts", {
  id: integer("id").primaryKey(),
  data: blob("data").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// export const items = sqliteTable("items", {
//   id: integer("id").primaryKey(),
//   title: text("title").notNull(),
//   description: text("description"),
//   createdAt: text("createdAt")
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
//   updatedAt: text("updatedAt")
//     .notNull()
//     .default(sql`CURRENT_TIMESTAMP`),
// });
