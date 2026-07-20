/**
 * Pure discovery/ranking helpers for the map presets page.
 * All functions take `now` explicitly so results are deterministic and testable.
 */

export type DiscoveryMap = {
  id: string;
  createdAt: string;
  views: number | null;
  likes: number | null;
};

export type SortMode = "trending" | "newest" | "views" | "likes";

const DAY_MS = 86_400_000;
const NEW_WINDOW_DAYS = 14;

/** SQLite CURRENT_TIMESTAMP is UTC without a timezone marker. */
export function parsePresetTimestamp(createdAt: string): number {
  const normalized = createdAt.includes("T")
    ? createdAt
    : `${createdAt.replace(" ", "T")}Z`;
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? 0 : ms;
}

function daysOld(createdAt: string, now: number): number {
  return Math.max(0, (now - parsePresetTimestamp(createdAt)) / DAY_MS);
}

export function isNewMap(
  createdAt: string,
  now: number,
  windowDays = NEW_WINDOW_DAYS,
): boolean {
  return daysOld(createdAt, now) < windowDays;
}

/**
 * Time-decayed popularity: engagement divided by a power of age,
 * so new maps surface without displacing genuinely popular ones.
 */
export function trendingScore(map: DiscoveryMap, now: number): number {
  const engagement = (map.likes ?? 0) * 3 + (map.views ?? 0);
  return engagement / Math.pow(daysOld(map.createdAt, now) + 2, 1.5);
}

/**
 * Deterministic daily pick: same map for everyone all day, changes at UTC
 * midnight, and every map gets rotation regardless of popularity. The
 * multiplicative hash scatters consecutive days across the catalog.
 */
export function pickMapOfTheDay<T extends DiscoveryMap>(
  maps: T[],
  now: number,
): T | null {
  if (maps.length === 0) return null;
  const ordered = [...maps].sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.id.localeCompare(b.id)
      : a.createdAt.localeCompare(b.createdAt),
  );
  const dayNumber = Math.floor(now / DAY_MS);
  const index = (dayNumber * 2654435761) % ordered.length;
  return ordered[index];
}

export function latestMaps<T extends DiscoveryMap>(maps: T[], count = 6): T[] {
  return [...maps]
    .sort(
      (a, b) =>
        parsePresetTimestamp(b.createdAt) - parsePresetTimestamp(a.createdAt),
    )
    .slice(0, count);
}

/**
 * Well-liked maps that few people have seen: ranked by like-to-view ratio
 * (dampened so a single lucky like on a zero-view map doesn't dominate).
 */
export function hiddenGems<T extends DiscoveryMap>(
  maps: T[],
  excludeIds: ReadonlySet<string>,
  count = 6,
): T[] {
  const gemScore = (map: DiscoveryMap) =>
    (map.likes ?? 0) / ((map.views ?? 0) + 10);
  return maps
    .filter((map) => (map.likes ?? 0) >= 1 && !excludeIds.has(map.id))
    .sort((a, b) => gemScore(b) - gemScore(a))
    .slice(0, count);
}

export function sortMaps<T extends DiscoveryMap>(
  maps: T[],
  mode: SortMode,
  now: number,
): T[] {
  const sorted = [...maps];
  switch (mode) {
    case "trending":
      sorted.sort((a, b) => trendingScore(b, now) - trendingScore(a, now));
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          parsePresetTimestamp(b.createdAt) -
          parsePresetTimestamp(a.createdAt),
      );
      break;
    case "views":
      sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      break;
    case "likes":
      sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      break;
  }
  return sorted;
}
