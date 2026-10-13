/**
 * Cursor pagination with real page numbers. Pages are fetched by cursor (the
 * last row of the previous page), and the server also hands out the starting
 * cursor of every page so the pager can jump straight to page N.
 *
 * Rows are ordered newest first by (timestamp, id); the id breaks ties so
 * the order, and every cursor, is stable.
 */

export type PageKey = { at: string; id: string };

export const HUB_PAGE_SIZE = 15;
export const SLICE_SET_PAGE_SIZE = 4;

export function encodeCursor(key: PageKey): string {
  return Buffer.from(JSON.stringify([key.at, key.id])).toString("base64url");
}

export function decodeCursor(cursor: string | undefined): PageKey | undefined {
  if (!cursor) return undefined;
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (Array.isArray(value) && typeof value[0] === "string" && typeof value[1] === "string") {
      return { at: value[0], id: value[1] };
    }
  } catch {
    // Mangled cursor: fall back to the first page.
  }
  return undefined;
}

/** Whether `a` sorts at or before `b` (newest first). */
function atOrBefore(a: PageKey, b: PageKey) {
  return a.at > b.at || (a.at === b.at && a.id >= b.id);
}

export type PageInfo = {
  page: number;
  pageCount: number;
  total: number;
  /** Cursor to fetch each page; index 0 (page 1) is null. */
  pageCursors: (string | null)[];
};

/** Page numbers for `keys` (already in order) as seen from `cursor`. */
export function pageInfo(keys: PageKey[], cursor: PageKey | undefined, pageSize = HUB_PAGE_SIZE): PageInfo {
  const total = keys.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageCursors: (string | null)[] = [null];
  for (let page = 1; page < pageCount; page++) {
    pageCursors.push(encodeCursor(keys[page * pageSize - 1]));
  }

  // Rows already shown on earlier pages. A cursor whose row has since been
  // archived or deleted still lands on the right page.
  const position = cursor ? keys.filter((key) => atOrBefore(key, cursor)).length : 0;
  const page = Math.min(pageCount, Math.floor(position / pageSize) + 1);

  return { page, pageCount, total, pageCursors };
}
