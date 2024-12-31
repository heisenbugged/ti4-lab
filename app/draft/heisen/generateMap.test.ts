import { expect, test } from "vitest";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { generateMap } from "./generateMap";

const defaultTestSettings = {
  type: "heisen",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 6,
  numSlices: 6,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

test("Heisen can properly generate maps", () => {
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
