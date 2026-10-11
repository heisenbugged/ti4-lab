import { eq } from "drizzle-orm";
import { db } from "./config.server";
import { soundboardSession } from "./schema.server";

export async function createSession(): Promise<
  typeof soundboardSession.$inferSelect
> {
  const id = await generateUniqueShortId();
  const session = await db.insert(soundboardSession).values({ id }).returning();
  return session[0];
}

async function generateUniqueShortId(): Promise<string> {
  const id = generateShortId();

  // Check if ID already exists
  const existing = await db
    .select()
    .from(soundboardSession)
    .where(eq(soundboardSession.id, id));

  if (existing.length > 0) {
    // ID exists, try again recursively
    return generateUniqueShortId();
  }

  return id;
}

function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
