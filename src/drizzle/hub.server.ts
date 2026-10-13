import { and, desc, eq, inArray, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { db } from "./config.server";
import {
  draftPresets,
  drafts,
  hubDrafts,
  hubSliceSets,
  hubs,
  users,
} from "./schema.server";
import type { DiscordUser } from "~/auth/discord.server";
import type { PageKey } from "~/utils/hubPagination";

export type HubDraftSource = "created" | "discord" | "imported";

export const HUB_SLUG_MAX_LENGTH = 40;
export const HUB_NAME_MAX_LENGTH = 60;
export const HUB_DESCRIPTION_MAX_LENGTH = 280;
export const HUB_LABEL_MAX_LENGTH = 80;

export function sanitizeHubSlug(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, HUB_SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

export async function hubBySlug(slug: string) {
  const rows = await db.select().from(hubs).where(eq(hubs.slug, slug)).limit(1);
  return rows[0];
}

export async function hubForOwner(userId: string) {
  const rows = await db
    .select()
    .from(hubs)
    .where(eq(hubs.ownerId, userId))
    .limit(1);
  return rows[0];
}

export async function userById(userId: string) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0];
}

async function uniqueSlug(base: string) {
  const root = sanitizeHubSlug(base) || "hub";
  for (let n = 1; ; n++) {
    const candidate = n === 1 ? root : `${root.slice(0, HUB_SLUG_MAX_LENGTH - 4)}-${n}`;
    if (!(await hubBySlug(candidate))) return candidate;
  }
}

/** Records a Discord sign-in, creating the account and its hub on first visit. */
export async function upsertUserWithHub(discordUser: DiscordUser) {
  await db
    .insert(users)
    .values({
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        username: discordUser.username,
        globalName: discordUser.global_name,
        avatar: discordUser.avatar,
        lastSeenAt: sql`CURRENT_TIMESTAMP`,
      },
    })
    .run();

  const existing = await hubForOwner(discordUser.id);
  if (existing) return existing;

  const displayName = discordUser.global_name ?? discordUser.username;
  const rows = await db
    .insert(hubs)
    .values({
      id: uuidv4(),
      ownerId: discordUser.id,
      slug: await uniqueSlug(discordUser.username),
      name: `${displayName}'s games`.slice(0, HUB_NAME_MAX_LENGTH),
    })
    .returning();
  return rows[0];
}

/** Returns an error message when the new slug is taken. */
export async function updateHub(
  hubId: string,
  input: { name: string; description: string; slug: string },
) {
  const taken = await hubBySlug(input.slug);
  if (taken && taken.id !== hubId) {
    return `The link /hub/${input.slug} is taken. Try another.`;
  }
  await db
    .update(hubs)
    .set({ ...input, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(hubs.id, hubId))
    .run();
  return undefined;
}

// ---------------------------------------------------------------- shared

/** Up to eight lowercase search words, each turned into a LIKE pattern. */
function searchWords(q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((term) => ({ term, like: `%${term.replace(/[%_]/g, "")}%` }));
}

/** Rows after `cursor` in newest-first (timestamp, id) order. */
function afterCursor(at: SQLiteColumn, id: SQLiteColumn, cursor: PageKey | undefined) {
  return cursor
    ? sql`(${at} < ${cursor.at} or (${at} = ${cursor.at} and ${id} < ${cursor.id}))`
    : undefined;
}

function archivedAt(archived: boolean | undefined) {
  if (archived === undefined) return {};
  return { archivedAt: archived ? new Date().toISOString() : null };
}

// ---------------------------------------------------------------- drafts

/** Adds a draft to a hub. Returns false if it was already there. */
export async function addDraftToHub(
  hubId: string,
  draftId: string,
  source: HubDraftSource,
) {
  const result = await db
    .insert(hubDrafts)
    .values({ hubId, draftId, source })
    .onConflictDoNothing()
    .run();
  return result.changes > 0;
}

/** Adds a new draft to its creator's hub, if they're signed in and have one. */
export async function addDraftToUserHub(
  userId: string | undefined,
  draftId: string,
  source: HubDraftSource,
) {
  if (!userId) return;
  const hub = await hubForOwner(userId);
  if (hub) await addDraftToHub(hub.id, draftId, source);
}

export type HubDraftStatus = "all" | "live" | "done" | "archived";

type HubDraftFilter = { status: HubDraftStatus; q: string };

/** Each search word must appear in the label, link name, players or format. */
function searchCondition(q: string) {
  const words = searchWords(q);
  if (words.length === 0) return undefined;
  return and(
    ...words.map(({ like }) => {
      return sql`(
        lower(coalesce(${hubDrafts.label}, '')) like ${like}
        or lower(coalesce(${drafts.urlName}, '')) like ${like}
        or coalesce(${drafts.playerNamesSearch}, '') like ${like}
        or lower(coalesce(${drafts.type}, '')) like ${like}
      )`;
    }),
  );
}

/** Drafts on the hub that have a link (skips half-created rows). */
function onHub(hubId: string): SQL[] {
  return [eq(hubDrafts.hubId, hubId), sql`${drafts.urlName} is not null`];
}

function filterConditions(hubId: string, { status, q }: HubDraftFilter) {
  return [
    ...onHub(hubId),
    status === "archived" ? isNotNull(hubDrafts.archivedAt) : isNull(hubDrafts.archivedAt),
    status === "live" ? sql`coalesce(${drafts.isComplete}, 0) = 0` : undefined,
    status === "done" ? eq(drafts.isComplete, true) : undefined,
    searchCondition(q),
  ];
}

/**
 * Just the ordering keys of every draft matching the search, for page
 * numbers and per-status counts. Cheap: no draft data is read.
 */
export async function hubDraftKeys(hubId: string, q: string) {
  return db
    .select({
      at: drafts.createdAt,
      id: drafts.id,
      isComplete: drafts.isComplete,
      archived: sql<number>`${hubDrafts.archivedAt} is not null`,
    })
    .from(hubDrafts)
    .innerJoin(drafts, eq(drafts.id, hubDrafts.draftId))
    .where(and(...onHub(hubId), searchCondition(q)))
    .orderBy(desc(drafts.createdAt), desc(drafts.id));
}

/** One page of drafts after `cursor` (the last row of the previous page). */
export async function hubDraftPage(
  hubId: string,
  filter: HubDraftFilter,
  cursor: PageKey | undefined,
  limit: number,
) {
  return db
    .select({
      draftId: drafts.id,
      urlName: drafts.urlName,
      data: drafts.data,
      type: drafts.type,
      mode: drafts.mode,
      phase: drafts.phase,
      isComplete: drafts.isComplete,
      selectionsCount: drafts.selectionsCount,
      pickOrderCount: drafts.pickOrderCount,
      imageUrl: drafts.imageUrl,
      incompleteImageUrl: drafts.incompleteImageUrl,
      createdAt: drafts.createdAt,
      updatedAt: drafts.updatedAt,
      source: hubDrafts.source,
      label: hubDrafts.label,
      archivedAt: hubDrafts.archivedAt,
    })
    .from(hubDrafts)
    .innerJoin(drafts, eq(drafts.id, hubDrafts.draftId))
    .where(and(...filterConditions(hubId, filter), afterCursor(drafts.createdAt, drafts.id, cursor)))
    .orderBy(desc(drafts.createdAt), desc(drafts.id))
    .limit(limit);
}

/** Every visible draft's status, without draft data, for the campaign record. */
export async function hubRecordRows(hubId: string) {
  return db
    .select({
      draftId: drafts.id,
      urlName: drafts.urlName,
      label: hubDrafts.label,
      phase: drafts.phase,
      isComplete: drafts.isComplete,
      selectionsCount: drafts.selectionsCount,
      pickOrderCount: drafts.pickOrderCount,
      createdAt: drafts.createdAt,
    })
    .from(hubDrafts)
    .innerJoin(drafts, eq(drafts.id, hubDrafts.draftId))
    .where(and(...onHub(hubId), isNull(hubDrafts.archivedAt)))
    .orderBy(drafts.createdAt);
}

export async function updateHubDraft(
  hubId: string,
  draftId: string,
  patch: { archived?: boolean; label?: string | null },
) {
  await db
    .update(hubDrafts)
    .set({ ...archivedAt(patch.archived), label: patch.label })
    .where(and(eq(hubDrafts.hubId, hubId), eq(hubDrafts.draftId, draftId)))
    .run();
}

// ---------------------------------------------------------------- slice sets

export async function addSliceSetToHub(
  hubId: string,
  presetId: string,
  title: string,
) {
  const result = await db
    .insert(hubSliceSets)
    .values({ id: uuidv4(), hubId, presetId, title })
    .onConflictDoNothing()
    .run();
  return result.changes > 0;
}

/**
 * Each search word must match the name, preset name or format; "6p" (or a
 * bare number) matches the player count.
 */
function sliceSetSearchCondition(q: string) {
  const words = searchWords(q);
  if (words.length === 0) return undefined;
  return and(
    ...words.map(({ term, like }) => {
      const players = term.match(/^(\d{1,2})p?$/);
      return sql`(
        lower(${hubSliceSets.title}) like ${like}
        or ${draftPresets.name} like ${like}
        or lower(coalesce(json_extract(${draftPresets.data}, '$.settings.type'), '')) like ${like}
        or lower(coalesce(json_extract(${draftPresets.data}, '$.settings.draftGameMode'), '')) like ${like}
        ${players ? sql`or ${draftPresets.playerCount} = ${Number(players[1])}` : sql``}
      )`;
    }),
  );
}

/** Ordering keys of every slice set matching the search, for page numbers and counts. */
export async function hubSliceSetKeys(hubId: string, q: string) {
  return db
    .select({
      at: hubSliceSets.addedAt,
      id: hubSliceSets.id,
      archived: sql<number>`${hubSliceSets.archivedAt} is not null`,
    })
    .from(hubSliceSets)
    .innerJoin(draftPresets, eq(draftPresets.id, hubSliceSets.presetId))
    .where(and(eq(hubSliceSets.hubId, hubId), sliceSetSearchCondition(q)))
    .orderBy(desc(hubSliceSets.addedAt), desc(hubSliceSets.id));
}

/** One page of slice sets after `cursor`, newest first. */
export async function hubSliceSetPage(
  hubId: string,
  filter: { archived: boolean; q: string },
  cursor: PageKey | undefined,
  limit: number,
) {
  return db
    .select({
      id: hubSliceSets.id,
      title: hubSliceSets.title,
      archivedAt: hubSliceSets.archivedAt,
      addedAt: hubSliceSets.addedAt,
      presetName: draftPresets.name,
      presetData: draftPresets.data,
      keepFactions: draftPresets.keepFactions,
      playerCount: draftPresets.playerCount,
    })
    .from(hubSliceSets)
    .innerJoin(draftPresets, eq(draftPresets.id, hubSliceSets.presetId))
    .where(
      and(
        eq(hubSliceSets.hubId, hubId),
        filter.archived ? isNotNull(hubSliceSets.archivedAt) : isNull(hubSliceSets.archivedAt),
        sliceSetSearchCondition(filter.q),
        afterCursor(hubSliceSets.addedAt, hubSliceSets.id, cursor),
      ),
    )
    .orderBy(desc(hubSliceSets.addedAt), desc(hubSliceSets.id))
    .limit(limit);
}

export async function updateHubSliceSet(
  hubId: string,
  sliceSetId: string,
  patch: { archived?: boolean; title?: string },
) {
  await db
    .update(hubSliceSets)
    .set({ ...archivedAt(patch.archived), title: patch.title })
    .where(and(eq(hubSliceSets.hubId, hubId), eq(hubSliceSets.id, sliceSetId)))
    .run();
}

// ---------------------------------------------------------------- import

export async function draftIdsByUrlNames(urlNames: string[]) {
  if (urlNames.length === 0) return new Map<string, string>();
  const rows = await db
    .select({ id: drafts.id, urlName: drafts.urlName })
    .from(drafts)
    .where(inArray(drafts.urlName, urlNames));
  return new Map(rows.map((row) => [row.urlName!, row.id]));
}

export async function draftIdsByIds(ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const rows = await db
    .select({ id: drafts.id })
    .from(drafts)
    .where(inArray(drafts.id, ids));
  return new Set(rows.map((row) => row.id));
}

export async function presetByNameForImport(name: string) {
  const rows = await db
    .select({ id: draftPresets.id, name: draftPresets.name })
    .from(draftPresets)
    .where(eq(draftPresets.name, name))
    .limit(1);
  return rows[0];
}

