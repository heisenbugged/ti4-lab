import { describe, expect, test } from "vitest";
import { SystemId } from "~/types";
import { systemData } from "~/data/systemData";
import {
  buildSliceValueConfig,
  calculateBreakdown,
  calculateSliceValue,
  CORE_SLICE_VALUE_CONFIG,
  SliceValueConfig,
  SliceValueModifiers,
} from "~/stats";
import { summarizeRaw } from "~/draft/helpers/sliceGeneration";
import {
  getAllSliceBreakdowns,
  getAllSliceStats,
  getAllSliceValues,
  getAllTileContributions,
} from "~/mapgen/utils/sliceScoring";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";

const SLICES: Record<string, SystemId[]> = {
  legendaries: ["65", "66", "99", "115", "4253"],
  tradeStationsAndScar: ["92", "109", "111", "117", "114"],
  scarTechWormholes: ["116", "101", "107", "26", "25"],
  anomaliesOnPath: ["43", "42", "56", "68", "80"],
  plain: ["19", "20", "27", "30", "36"],
  mixed: ["97", "100", "102", "4269", "82"],
  empty: [],
  coreLegendary: ["66", "4269", "92"],
  coreSupernova: ["43", "109", "116"],
  coreNebula: ["68", "115", "25"],
  corePartial: ["56", "99"],
};

const CUSTOM_MODIFIERS: Partial<SliceValueModifiers> = {
  techValue: 0.3,
  equidistantMultiplier: 0.3,
  hopesEndValue: 1.7,
  tradeStationValue: 0.6,
  entropicScarValue: 1.1,
  supernovaOnPathPenalty: -1.3,
  nebulaOnPathPenalty: -0.7,
};

const CONFIGS: Record<string, Partial<SliceValueConfig>> = {
  none: {},
  built: buildSliceValueConfig(),
  miltyEquidistant: buildSliceValueConfig(undefined, [3], [1, 4]),
  heisenPath: buildSliceValueConfig(undefined, [], [1]),
  allPath: buildSliceValueConfig(undefined, [], [0, 1, 2, 3, 4]),
  core: buildSliceValueConfig(undefined, [1, 2], [0]),
  customMilty: buildSliceValueConfig(CUSTOM_MODIFIERS, [3], [1, 4]),
  customCore: buildSliceValueConfig(CUSTOM_MODIFIERS, [1, 2], [0]),
  modifiersOnly: { ...CUSTOM_MODIFIERS },
};

const systems = (ids: SystemId[]) => ids.map((id) => systemData[id]);

describe("slice value characterization", () => {
  test("calculateSliceValue", () => {
    const out: Record<string, Record<string, number>> = {};
    for (const [sliceName, ids] of Object.entries(SLICES)) {
      out[sliceName] = {};
      for (const [cfgName, cfg] of Object.entries(CONFIGS)) {
        out[sliceName][cfgName] = calculateSliceValue(systems(ids), cfg);
      }
    }
    expect(out).toMatchSnapshot();
  });

  test("calculateBreakdown", () => {
    const out: Record<string, unknown> = {};
    for (const [sliceName, ids] of Object.entries(SLICES)) {
      for (const [cfgName, cfg] of Object.entries(CONFIGS)) {
        out[`${sliceName}/${cfgName}`] = calculateBreakdown(systems(ids), cfg);
      }
    }
    expect(out).toMatchSnapshot();
  });

  test("breakdown total matches slice value", () => {
    for (const ids of Object.values(SLICES)) {
      for (const cfg of Object.values(CONFIGS)) {
        expect(calculateBreakdown(systems(ids), cfg).total).toBeCloseTo(
          calculateSliceValue(systems(ids), cfg),
          10,
        );
      }
    }
  });

  test("core slice breakdown", () => {
    const out: Record<string, unknown> = {};
    for (const [sliceName, ids] of Object.entries(SLICES)) {
      out[`${sliceName}/default`] = calculateBreakdown(
        systems(ids),
        CORE_SLICE_VALUE_CONFIG,
      );
      out[`${sliceName}/custom`] = calculateBreakdown(systems(ids), {
        ...CUSTOM_MODIFIERS,
        ...CORE_SLICE_VALUE_CONFIG,
      });
    }
    expect(out).toMatchSnapshot();
  });

  test("summarizeRaw", () => {
    const out: Record<string, unknown> = {};
    for (const [sliceName, ids] of Object.entries(SLICES)) {
      out[`${sliceName}/default`] = summarizeRaw(ids);
      out[`${sliceName}/custom`] = summarizeRaw(ids, CUSTOM_MODIFIERS);
    }
    expect(out).toMatchSnapshot();
  });

  // Ring 3 homes at idx 19, 22, 25, 28, 31, 34; parts[i] is map idx i + 1.
  const MAP_STRINGS: Record<string, string> = {
    standard: [
      "66,43,92,115,68,26",
      "65,19,109,42,111,114,99,80,4253,20,116,101",
      "H0,27,30,H1,25,56,H2,107,36,H3,97,100,H4,102,4269,H5,82,117",
    ].join(","),
    sparse: [
      "43,_,114,_,42,X",
      "_,_,65,_,_,_,_,_,4276,_,_,_",
      "H0,_,_,H1,_,_,H2,_,_,H3,_,_,_,_,_,_,_,_",
    ].join(","),
  };

  test("mapgen sliceScoring", () => {
    const out: Record<string, unknown> = {};
    for (const [name, mapString] of Object.entries(MAP_STRINGS)) {
      const decoded = decodeMapString(mapString);
      expect(decoded).not.toBeNull();
      const map = decoded!.map;
      out[`${name}/values`] = getAllSliceValues(map);
      out[`${name}/breakdowns`] = getAllSliceBreakdowns(map);
      out[`${name}/stats`] = getAllSliceStats(map);
      const contributions = getAllTileContributions(map);
      out[`${name}/contributions`] = Object.fromEntries(
        Object.entries(contributions).map(([home, m]) => [
          home,
          Object.fromEntries(m.entries()),
        ]),
      );
    }
    expect(out).toMatchSnapshot();
  });
});
