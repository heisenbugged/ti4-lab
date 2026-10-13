import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor, pageInfo, type PageKey } from "./hubPagination";

// 7 drafts, newest first; two share a timestamp.
const keys: PageKey[] = [
  { at: "2026-10-07 10:00:00", id: "g" },
  { at: "2026-10-06 10:00:00", id: "f" },
  { at: "2026-10-05 10:00:00", id: "e" },
  { at: "2026-10-05 10:00:00", id: "d" },
  { at: "2026-10-03 10:00:00", id: "c" },
  { at: "2026-10-02 10:00:00", id: "b" },
  { at: "2026-10-01 10:00:00", id: "a" },
];

describe("hub pagination", () => {
  it("round-trips cursors and ignores junk", () => {
    expect(decodeCursor(encodeCursor(keys[3]))).toEqual(keys[3]);
    expect(decodeCursor("not-a-cursor")).toBeUndefined();
    expect(decodeCursor(undefined)).toBeUndefined();
  });

  it("hands out a cursor per page, ending each page's predecessor", () => {
    const info = pageInfo(keys, undefined, 3);
    expect(info).toMatchObject({ page: 1, pageCount: 3, total: 7 });
    expect(info.pageCursors[0]).toBeNull();
    expect(decodeCursor(info.pageCursors[1]!)).toEqual(keys[2]);
    expect(decodeCursor(info.pageCursors[2]!)).toEqual(keys[5]);
  });

  it("works out the current page from the cursor", () => {
    const info = pageInfo(keys, undefined, 3);
    expect(pageInfo(keys, decodeCursor(info.pageCursors[1]!), 3).page).toBe(2);
    expect(pageInfo(keys, decodeCursor(info.pageCursors[2]!), 3).page).toBe(3);
  });

  it("keeps the page when the cursor row is gone", () => {
    const withoutE = keys.filter((k) => k.id !== "e");
    // Cursor still points at "e" (end of page 1 of 2 when page size is 3).
    expect(pageInfo(withoutE, keys[2], 3).page).toBe(1);
    expect(pageInfo(withoutE, keys[3], 3).page).toBe(2);
  });

  it("has one empty page when nothing matches", () => {
    expect(pageInfo([], undefined, 3)).toMatchObject({ page: 1, pageCount: 1, total: 0, pageCursors: [null] });
  });
});
