import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

if (!process.env.TI4_LAB_DATABASE_PATH) {
  throw new Error("Missing environment variable: TI4_LAB_DATABASE_PATH");
}
export const db = drizzle(
  new Database(new URL(process.env.TI4_LAB_DATABASE_PATH).pathname),
);
// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
});
