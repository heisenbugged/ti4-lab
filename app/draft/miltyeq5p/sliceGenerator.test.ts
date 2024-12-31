import { expect, test } from "vitest";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { generateMap } from "../miltyeq/sliceGenerator";

const defaultTestSettings = {
  type: "miltyeq5p",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 2,
  numSlices: 10,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

test("Milty-EQ 5p can properly generate maps", () => {
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

test("Milty-EQ 5p generates with discordant stars", () => {
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
