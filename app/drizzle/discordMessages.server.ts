import { eq, and } from "drizzle-orm";
import { draftDiscordMessages } from "./schema.server";
import { db } from "./config.server";

export async function getDiscordPickMessage(draftId: string, pick: number) {
  const results = await db
    .select()
    .from(draftDiscordMessages)
    .where(
      and(
        eq(draftDiscordMessages.draftId, draftId),
        eq(draftDiscordMessages.pick, pick),
      ),
    )
    .limit(1);

  return results[0]?.messageId;
}

export async function addDiscordPickMessage(
  draftId: string,
  pick: number,
  messageId: string,
) {
  await db
    .insert(draftDiscordMessages)
    .values({
      draftId,
      pick,
      messageId,
    })
    .onConflictDoUpdate({
      target: [draftDiscordMessages.draftId, draftDiscordMessages.pick],
      set: { messageId },
    });
}

export async function deleteDiscordPickMessage(draftId: string, pick: number) {
  await db
    .delete(draftDiscordMessages)
    .where(
      and(
        eq(draftDiscordMessages.draftId, draftId),
        eq(draftDiscordMessages.pick, pick),
      ),
    );
}
