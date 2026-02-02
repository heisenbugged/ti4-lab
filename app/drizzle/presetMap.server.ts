import { desc, eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "./config.server";
import { presetMapLikes, presetMaps } from "./schema.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { calculateMapStats } from "~/mapgen/utils/mapStats";
import { getAllSliceValues } from "~/mapgen/utils/sliceScoring";

export type PresetMapRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  mapString: string;
  mapConfigId: string;
  likes: number;
  views: number;
  avgSliceValue: number | null;
  totalResources: number | null;
  totalInfluence: number | null;
  legendaries: number | null;
  techSkips: string | null; // JSON: {"G":2,"R":1,"B":3,"Y":1}
  createdAt: string;
  updatedAt: string;
};

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
export function computeMapStats(mapString: string): {
  avgSliceValue: number | null;
  totalResources: number;
  totalInfluence: number;
  legendaries: number;
  techSkips: string;
} | null {
  const decoded = decodeMapString(mapString);
  if (!decoded) return null;

  const { map } = decoded;
  const mapStats = calculateMapStats(map);

  // Calculate average slice value
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

/**
 * Generate a URL-friendly slug from a name.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
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

  // Check if slug exists, append number if needed
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db
      .select({ id: presetMaps.id })
      .from(presetMaps)
      .where(eq(presetMaps.slug, slug))
      .limit(1);

    if (existing.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Compute map statistics
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

export async function listPresetMaps(): Promise<PresetMapRecord[]> {
  return (await db
    .select()
    .from(presetMaps)
    .orderBy(desc(presetMaps.createdAt))) as PresetMapRecord[];
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

export async function incrementPresetMapViews(id: string): Promise<number> {
  await db
    .update(presetMaps)
    .set({ views: sql`${presetMaps.views} + 1` })
    .where(eq(presetMaps.id, id));

  const result = await db
    .select({ views: presetMaps.views })
    .from(presetMaps)
    .where(eq(presetMaps.id, id))
    .limit(1);

  return result[0]?.views ?? 0;
}

export async function likePresetMap(
  id: string,
  ip: string,
): Promise<{ likes: number; liked: boolean }> {
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: presetMapLikes.id })
      .from(presetMapLikes)
      .where(
        and(eq(presetMapLikes.presetMapId, id), eq(presetMapLikes.ip, ip)),
      )
      .limit(1);

    if (existing.length > 0) {
      const current = await tx
        .select({ likes: presetMaps.likes })
        .from(presetMaps)
        .where(eq(presetMaps.id, id))
        .limit(1);
      return { likes: current[0]?.likes ?? 0, liked: true };
    }

    await tx.insert(presetMapLikes).values({
      id: uuidv4(),
      presetMapId: id,
      ip,
    });

    await tx
      .update(presetMaps)
      .set({ likes: sql`${presetMaps.likes} + 1` })
      .where(eq(presetMaps.id, id));

    const current = await tx
      .select({ likes: presetMaps.likes })
      .from(presetMaps)
      .where(eq(presetMaps.id, id))
      .limit(1);

    return { likes: current[0]?.likes ?? 0, liked: true };
  });
}
