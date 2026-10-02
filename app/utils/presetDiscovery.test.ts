import { describe, expect, it } from "vitest";
import {
  browseMaps,
  DiscoveryMap,
  groupByAuthor,
  parseBrowseFilters,
  playerCountOptions,
  sortMaps,
  spotlightPool,
} from "./presetDiscovery";
import {
  fingerprintFromMap,
  fingerprintFromMapString,
  playerCountFromMapString,
} from "./presetFingerprint";

function map(overrides: Partial<DiscoveryMap> & { id: string }): DiscoveryMap {
  return {
    author: "someone",
    createdAt: "2026-05-01 00:00:00",
    views: 0,
    draftCount: 0,
    featured: false,
    playerCount: 6,
    ...overrides,
  };
}

const ids = (maps: { id: string }[]) => maps.map((m) => m.id);

describe("sortMaps", () => {
  it("ranks by drafts, then views, then newest", () => {
    const maps = [
      map({ id: "viewed", views: 500 }),
      map({ id: "played", draftCount: 3 }),
      map({ id: "new", createdAt: "2026-09-01 00:00:00" }),
      map({ id: "old" }),
    ];
    expect(ids(sortMaps(maps, "played"))).toEqual([
      "played",
      "viewed",
      "new",
      "old",
    ]);
  });
});

describe("groupByAuthor", () => {
  it("keeps each author's top two and counts the rest on their first card", () => {
    const sorted = [
      map({ id: "a1", author: "Anthony" }),
      map({ id: "b1", author: "Odsh" }),
      map({ id: "a2", author: "anthony " }),
      map({ id: "a3", author: "Anthony" }),
      map({ id: "a4", author: "Anthony" }),
    ];
    const grouped = groupByAuthor(sorted);
    expect(ids(grouped)).toEqual(["a1", "b1", "a2"]);
    expect(grouped.map((m) => m.moreByAuthor)).toEqual([2, 0, 0]);
  });
});

describe("browseMaps", () => {
  const maps = [
    map({ id: "a1", author: "Anthony", playerCount: 4, draftCount: 2 }),
    map({ id: "a2", author: "Anthony", playerCount: 4, draftCount: 1 }),
    map({ id: "a3", author: "Anthony", playerCount: 4 }),
    map({ id: "c1", author: "Cyco", playerCount: 6, draftCount: 9 }),
  ];

  it("filters by player count and groups by author", () => {
    const result = browseMaps(maps, {
      sort: "played",
      players: 4,
      author: null,
    });
    expect(ids(result)).toEqual(["a1", "a2"]);
    expect(result[0].moreByAuthor).toBe(1);
  });

  it("shows every map, ungrouped, when browsing one author", () => {
    const result = browseMaps(maps, {
      sort: "played",
      players: null,
      author: "anthony",
    });
    expect(ids(result)).toEqual(["a1", "a2", "a3"]);
    expect(result.every((m) => m.moreByAuthor === 0)).toBe(true);
  });
});

describe("parseBrowseFilters", () => {
  it("falls back to defaults on bad input", () => {
    expect(
      parseBrowseFilters(new URLSearchParams("sort=trending&players=abc")),
    ).toEqual({ sort: "played", players: null, author: null });
    expect(
      parseBrowseFilters(
        new URLSearchParams("sort=newest&players=5&author=Odsh"),
      ),
    ).toEqual({ sort: "newest", players: 5, author: "Odsh" });
  });
});

describe("spotlightPool", () => {
  it("prefers featured maps, then played ones", () => {
    const maps = [
      map({ id: "played", draftCount: 4 }),
      map({ id: "unplayed" }),
    ];
    expect(ids(spotlightPool(maps))).toEqual(["played"]);
    expect(
      ids(spotlightPool([...maps, map({ id: "picked", featured: true })])),
    ).toEqual(["picked"]);
  });
});

describe("playerCountOptions", () => {
  it("lists 3–8 player counts present and skips malformed ones", () => {
    const maps = [
      map({ id: "1", playerCount: 4 }),
      map({ id: "2", playerCount: 4 }),
      map({ id: "3", playerCount: 6 }),
      map({ id: "4", playerCount: 0 }),
      map({ id: "5", playerCount: 11 }),
    ];
    expect(playerCountOptions(maps)).toEqual([4, 6]);
  });
});

describe("preset fingerprints", () => {
  const systems = ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
  const mapString = [
    "19:60",
    ...systems.slice(1, 5),
    "H0",
    "_",
    ...systems.slice(5),
    "H1",
    "X",
  ].join(",");

  it("matches a draft's map to the preset string it came from", () => {
    const draftMap = [
      { idx: 0, type: "SYSTEM", systemId: "18" },
      ...mapString.split(",").map((token, i) => ({
        idx: i + 1,
        type: token.startsWith("H")
          ? "HOME"
          : token === "_"
            ? "OPEN"
            : token === "X"
              ? "CLOSED"
              : "SYSTEM",
        systemId: token.split(":")[0],
      })),
    ].reverse();
    expect(fingerprintFromMapString(mapString)).toBe(systems.join(","));
    expect(fingerprintFromMap(draftMap)).toBe(systems.join(","));
  });

  it("ignores layouts too sparse to identify", () => {
    expect(fingerprintFromMapString("19,20,H0")).toBeNull();
  });

  it("counts seats from distinct home tiles", () => {
    expect(playerCountFromMapString(mapString)).toBe(2);
    expect(playerCountFromMapString("19,20")).toBe(0);
  });
});
