import { expect, test } from "vitest";
import { generateMap } from "./sliceGenerator";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";

const defaultTestSettings = {
  type: "miltyeq",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 2,
  numSlices: 6,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

test("properly generates maps", () => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    ...defaultTestSettings,
  };

  const systemPool = getSystemPool(["base", "pok"]);
  const iterations = 10000;
  for (let i = 0; i < iterations; i++) {
    try {
      const result = generateMap(settings, [...systemPool]);
      expect(result, `Failed on iteration ${i + 1}`).toBeDefined();
      expect(result?.valid, `Map was invalid on iteration ${i + 1}`).toBe(true);
    } catch (e) {
      console.log(`Failed on iteration ${i + 1}`);
      throw e;
    }
  }
});

test("properly generates maps with 8 slices", () => {
  const settings: DraftSettings = {
    ...defaultTestSettings,
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    numSlices: 8,
  };
  const systemPool = getSystemPool(["base", "pok"]);
  const iterations = 10000;
  for (let i = 0; i < iterations; i++) {
    try {
      const result = generateMap(settings, [...systemPool]);
      expect(result, `Failed on iteration ${i + 1}`).toBeDefined();
      expect(result?.valid, `Map was invalid on iteration ${i + 1}`).toBe(true);
    } catch (e) {
      console.log(`Failed on iteration ${i + 1}`);
      throw e;
    }
  }
});

test("Milty-EQ generates with discordant stars", () => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok", "discordant", "discordantexp"],
    tileGameSets: [
      "base",
      "pok",
      "discordant",
      "discordantexp",
      "unchartedstars",
    ],
    ...defaultTestSettings,
  };
  const systemPool = getSystemPool([
    "base",
    "pok",
    "discordant",
    "discordantexp",
    "unchartedstars",
  ]);
  const iterations = 10000;
  for (let i = 0; i < iterations; i++) {
    try {
      const result = generateMap(settings, [...systemPool]);
      expect(result, `Failed on iteration ${i + 1}`).toBeDefined();
      expect(result?.valid, `Map was invalid on iteration ${i + 1}`).toBe(true);
    } catch (e) {
      console.log(`Failed on iteration ${i + 1}`);
      throw e;
    }
  }
});
