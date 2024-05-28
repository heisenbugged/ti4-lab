import { sql } from "drizzle-orm";
import { sqliteTable, text, blob } from "drizzle-orm/sqlite-core";

// Define a function to generate UUIDs for default values
export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  data: blob("data").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
