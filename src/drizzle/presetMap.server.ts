import { desc, eq, and, lt, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "./config.server";
import { presetMapLikes, presetMaps, presetMapViews } from "./schema.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { calculateMapStats } from "~/utils/mapStats";
import { getAllSliceValues } from "~/mapgen/utils/sliceScoring";
import {
  fingerprintFromMap,
  fingerprintFromMapString,
  playerCountFromMapString,
} from "~/utils/presetFingerprint";
import { DAY_MS, parsePresetTimestamp } from "~/utils/presetDiscovery";
import type { Map } from "~/types";

export type PresetMapRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  mapString: string;
  mapConfigId: string;
  imageUrl: string | null;
  likes: number;
  views: number;
  avgSliceValue: number | null;
  totalResources: number | null;
  totalInfluence: number | null;
  legendaries: number | null;
  techSkips: string | null; // JSON: {"G":2,"R":1,"B":3,"Y":1}
  draftCount: number;
  hidden: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A listing row: the stored record plus seats derived from its home tiles. */
export type PresetMapListing = PresetMapRecord & { playerCount: number };

export type TechSkipsData = {
  G: number;
  R: number;
  B: number;
  Y: number;
};

/**
 * Computes map statistics from a map string.
 * Returns null if the map string is invalid.
 */
function computeMapStats(mapString: string): {
  avgSliceValue: number | null;
  totalResources: number;
  totalInfluence: number;
  legendaries: number;
  techSkips: string;
} | null {
  const decoded = decodeMapString(mapString);
  if (!decoded) return null;

  const { map } = decoded;
  const mapStats = calculateMapStats([], map);

  const sliceValues = getAllSliceValues(map);
  const values = Object.values(sliceValues);
  const avgSliceValue =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
        10
      : null;

  return {
    avgSliceValue,
    totalResources: mapStats.totalResources,
    totalInfluence: mapStats.totalInfluence,
    legendaries: mapStats.totalLegendary,
    techSkips: JSON.stringify({
      G: mapStats.bioticSkips,
      R: mapStats.warfareSkips,
      B: mapStats.propulsionSkips,
      Y: mapStats.cyberneticSkips,
    }),
  };
}

/** URL-friendly slug: lowercase, hyphen-separated, ASCII letters and digits only. */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugTaken(slug: string): boolean {
  return (
    db
      .select({ id: presetMaps.id })
      .from(presetMaps)
      .where(eq(presetMaps.slug, slug))
      .get() != null
  );
}

export async function createPresetMap(input: {
  name: string;
  description: string;
  author: string;
  mapString: string;
  mapConfigId: string;
}): Promise<PresetMapRecord> {
  const id = uuidv4();
  const baseSlug = generateSlug(input.name);

  let slug = baseSlug;
  for (let counter = 1; slugTaken(slug); counter++) {
    slug = `${baseSlug}-${counter}`;
  }

  const stats = computeMapStats(input.mapString);

  await db.insert(presetMaps).values({
    id,
    slug,
    name: input.name,
    description: input.description,
    author: input.author,
    mapString: input.mapString,
    mapConfigId: input.mapConfigId,
    avgSliceValue: stats?.avgSliceValue ?? null,
    totalResources: stats?.totalResources ?? null,
    totalInfluence: stats?.totalInfluence ?? null,
    legendaries: stats?.legendaries ?? null,
    techSkips: stats?.techSkips ?? null,
  });

  const result = await db
    .select()
    .from(presetMaps)
    .where(eq(presetMaps.id, id))
    .limit(1);

  return result[0] as PresetMapRecord;
}

export async function listPresetMaps({
  includeHidden = false,
}: { includeHidden?: boolean } = {}): Promise<PresetMapListing[]> {
  const rows = (await db
    .select()
    .from(presetMaps)
    .where(includeHidden ? undefined : eq(presetMaps.hidden, false))
    .orderBy(desc(presetMaps.createdAt))) as PresetMapRecord[];
  // mapConfigId is unreliable for seat count (most "milty6p" maps aren't 6p),
  // so derive it from the home tiles actually placed.
  return rows.map((row) => ({
    ...row,
    playerCount: playerCountFromMapString(row.mapString),
  }));
}

export async function setPresetMapFlags(
  id: string,
  flags: { hidden?: boolean; featured?: boolean },
): Promise<void> {
  await db
    .update(presetMaps)
    .set({ ...flags, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(presetMaps.id, id))
    .run();
}

/**
 * Credits a newly created draft to the preset map it was played on, if its
 * layout matches one. When several presets share a layout (re-uploads), the
 * oldest listed one gets the credit, matching scripts/curate-preset-maps.ts.
 * Never throws — draft creation must not depend on it.
 */
export function recordPresetMapPlay(map: Map | undefined): void {
  try {
    const fingerprint = fingerprintFromMap(map);
    if (!fingerprint) return;

    const candidates = db
      .select({
        id: presetMaps.id,
        mapString: presetMaps.mapString,
        createdAt: presetMaps.createdAt,
        hidden: presetMaps.hidden,
      })
      .from(presetMaps)
      .all()
      .filter((row) => fingerprintFromMapString(row.mapString) === fingerprint)
      .sort(
        (a, b) =>
          Number(a.hidden) - Number(b.hidden) ||
          parsePresetTimestamp(a.createdAt) - parsePresetTimestamp(b.createdAt),
      );
    const original = candidates[0];
    if (!original) return;

    db.update(presetMaps)
      .set({ draftCount: sql`${presetMaps.draftCount} + 1` })
      .where(eq(presetMaps.id, original.id))
      .run();
  } catch (error) {
    console.error("Failed to record preset map play", error);
  }
}

export async function presetMapById(
  id: string,
): Promise<PresetMapRecord | undefined> {
  const results = await db
    .select()
    .from(presetMaps)
    .where(eq(presetMaps.id, id))
    .limit(1);

  return results[0] as PresetMapRecord | undefined;
}

export async function presetMapBySlug(
  slug: string,
): Promise<PresetMapRecord | undefined> {
  const results = await db
    .select()
    .from(presetMaps)
    .where(eq(presetMaps.slug, slug))
    .limit(1);

  return results[0] as PresetMapRecord | undefined;
}

export async function updatePresetMapImageUrl(
  id: string,
  imageUrl: string,
): Promise<void> {
  await db
    .update(presetMaps)
    .set({ imageUrl, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(presetMaps.id, id))
    .run();
}

const VIEW_RETENTION_DAYS = 2;

/**
 * Counts a view at most once per viewer per map per UTC day. Returns the
 * map's (possibly unchanged) view total.
 */
export function recordPresetMapView(id: string, viewer: string): number {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const cutoff = new Date(now.getTime() - VIEW_RETENTION_DAYS * DAY_MS)
    .toISOString()
    .slice(0, 10);

  return db.transaction((tx) => {
    const inserted = tx
      .insert(presetMapViews)
      .values({ day, presetMapId: id, viewer })
      .onConflictDoNothing()
      .run();

    if (inserted.changes > 0) {
      tx.update(presetMaps)
        .set({ views: sql`${presetMaps.views} + 1` })
        .where(eq(presetMaps.id, id))
        .run();
      tx.delete(presetMapViews).where(lt(presetMapViews.day, cutoff)).run();
    }

    const current = tx
      .select({ views: presetMaps.views })
      .from(presetMaps)
      .where(eq(presetMaps.id, id))
      .get();
    return current?.views ?? 0;
  });
}

export async function likePresetMap(id: string, ip: string): Promise<number> {
  return db.transaction((tx) => {
    const existing = tx
      .select({ id: presetMapLikes.id })
      .from(presetMapLikes)
      .where(and(eq(presetMapLikes.presetMapId, id), eq(presetMapLikes.ip, ip)))
      .get();

    if (!existing) {
      tx.insert(presetMapLikes)
        .values({
          id: uuidv4(),
          presetMapId: id,
          ip,
        })
        .run();

      tx.update(presetMaps)
        .set({ likes: sql`${presetMaps.likes} + 1` })
        .where(eq(presetMaps.id, id))
        .run();
    }

    const current = tx
      .select({ likes: presetMaps.likes })
      .from(presetMaps)
      .where(eq(presetMaps.id, id))
      .get();

    return current?.likes ?? 0;
  });
}
