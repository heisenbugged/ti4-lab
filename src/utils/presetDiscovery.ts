/**
 * Pure discovery/ranking helpers for the map presets page. Time-dependent
 * functions take `now` explicitly so results are deterministic and testable.
 *
 * Ranking leans on draftCount (drafts actually started on a map). Likes are
 * too sparse and views too noisy to rank by on their own.
 */

export type DiscoveryMap = {
  id: string;
  author: string;
  createdAt: string;
  views: number;
  draftCount: number;
  featured: boolean;
  playerCount: number;
};

export const PRESET_PAGE_SIZE = 24;

const SORT_MODES = ["played", "newest"] as const;
export type SortMode = (typeof SORT_MODES)[number];

function isSortMode(value: unknown): value is SortMode {
  return SORT_MODES.includes(value as SortMode);
}

export type BrowseFilters = {
  sort: SortMode;
  players: number | null;
  author: string | null;
};

/** The filters as they appear in the URL; defaults are left out. */
export type BrowseSearch = {
  sort?: SortMode;
  players?: number;
  author?: string;
};

/** Reads filters from (router-parsed) search params, ignoring anything malformed. */
export function parseBrowseFilters(search: Record<string, unknown>): BrowseFilters {
  const players = Number(search.players);
  const author = search.author == null ? "" : String(search.author).trim();
  return {
    sort: isSortMode(search.sort) ? search.sort : "played",
    players: Number.isInteger(players) && players > 0 ? players : null,
    author: author || null,
  };
}

/** The URL form of a set of filters. */
export function browseSearch(filters: BrowseFilters): BrowseSearch {
  return {
    sort: filters.sort === "played" ? undefined : filters.sort,
    players: filters.players ?? undefined,
    author: filters.author ?? undefined,
  };
}

export const DAY_MS = 86_400_000;
const NEW_WINDOW_DAYS = 14;
const MAPS_PER_AUTHOR = 2;
const SPOTLIGHT_POOL_SIZE = 24;

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

export function isNewMap(createdAt: string, now: number): boolean {
  return daysOld(createdAt, now) < NEW_WINDOW_DAYS;
}

export function authorKey(author: string): string {
  return author.trim().toLowerCase();
}

export function matchesFilters(
  map: DiscoveryMap,
  filters: Pick<BrowseFilters, "players" | "author">,
): boolean {
  return (
    (filters.players == null || map.playerCount === filters.players) &&
    (filters.author == null ||
      authorKey(map.author) === authorKey(filters.author))
  );
}

/**
 * Deterministic daily pick: same map for everyone all day, changes at UTC
 * midnight. The multiplicative hash scatters consecutive days across the pool.
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

/**
 * Maps eligible for the daily spotlight: hand-featured ones when there are
 * any, otherwise the most-played, so it never lands on an untested map.
 */
export function spotlightPool<T extends DiscoveryMap>(maps: T[]): T[] {
  const featured = maps.filter((map) => map.featured);
  if (featured.length > 0) return featured;
  const played = sortMaps(
    maps.filter((map) => map.draftCount > 0),
    "played",
  ).slice(0, SPOTLIGHT_POOL_SIZE);
  return played.length > 0 ? played : maps;
}

export function latestMaps<T extends DiscoveryMap>(
  maps: T[],
  count: number,
): T[] {
  return sortMaps(maps, "newest").slice(0, count);
}

export function sortMaps<T extends DiscoveryMap>(
  maps: T[],
  mode: SortMode,
): T[] {
  const newestFirst = (a: T, b: T) =>
    parsePresetTimestamp(b.createdAt) - parsePresetTimestamp(a.createdAt);
  const sorted = [...maps];
  switch (mode) {
    case "played":
      // Views only break ties among equally played (mostly unplayed) maps.
      sorted.sort(
        (a, b) =>
          b.draftCount - a.draftCount || b.views - a.views || newestFirst(a, b),
      );
      break;
    case "newest":
      sorted.sort(newestFirst);
      break;
  }
  return sorted;
}

export type GroupedMap<T> = T & { moreByAuthor: number };

/**
 * Keeps each author's top maps (in the current order) and folds the rest
 * behind a "more by" count on their first card, so prolific authors don't
 * crowd out everyone else.
 */
export function groupByAuthor<T extends DiscoveryMap>(
  sorted: T[],
  perAuthor = MAPS_PER_AUTHOR,
): GroupedMap<T>[] {
  const totals = new Map<string, number>();
  for (const map of sorted) {
    const key = authorKey(map.author);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  const shown = new Map<string, number>();
  const result: GroupedMap<T>[] = [];
  for (const map of sorted) {
    const key = authorKey(map.author);
    const count = shown.get(key) ?? 0;
    if (count >= perAuthor) continue;
    shown.set(key, count + 1);
    result.push({
      ...map,
      moreByAuthor: count === 0 ? Math.max(0, totals.get(key)! - perAuthor) : 0,
    });
  }
  return result;
}

/** Filter, sort and (unless browsing one author) group the catalog. */
export function browseMaps<T extends DiscoveryMap>(
  maps: T[],
  filters: BrowseFilters,
): GroupedMap<T>[] {
  const sorted = sortMaps(
    maps.filter((map) => matchesFilters(map, filters)),
    filters.sort,
  );
  return filters.author
    ? sorted.map((map) => ({ ...map, moreByAuthor: 0 }))
    : groupByAuthor(sorted);
}

// Malformed maps can have 0 or 10+ home tiles; they stay under "any".
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;

/** Player counts present in the catalog, ascending. */
export function playerCountOptions(maps: DiscoveryMap[]): number[] {
  const counts = new Set(
    maps
      .map((map) => map.playerCount)
      .filter((count) => count >= MIN_PLAYERS && count <= MAX_PLAYERS),
  );
  return [...counts].sort((a, b) => a - b);
}
