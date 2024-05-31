/**
 * NOTE: CODE PORTED FROM TTPG.
 * @link https://github.com/TI4-Online/TI4-TTPG/blob/main/src/lib/draft/abstract/abstract-slice-generator.js
 * Has been adapted to 'typescript' and minor modifications to better fit
 * with the aesthetic of this project, but largely unchanged.
 */
import { System } from "~/types";
import { systemData } from "~/data/systemData";
import { ChoosableTier, TieredSlice, TieredSystems } from "./types";
import { neighbors } from "./hex";
import { getTieredSystems } from "./tieredSystems";

const DEBUG_SLICE_SCORING = false;

/**
 * Given an array of options, each with a weight, randomly choose one of the options
 * based on the weights. Internally uses a cumulative distribution function.
 */
export function weightedChoice(options) {
  let total = 0;
  for (const option of options) {
    total += option.weight;
  }
  let target = Math.random() * total;
  for (const option of options) {
    if (target <= option.weight) {
      let result = option.value;
      if (Array.isArray(result)) {
        result = [...result]; // shallow copy
      }
      return result;
    }
    target -= option.weight;
  }
  throw new Error("unreachable");
}

/**
 * Performs a Fisher-Yates shuffle on the given array and returns the shuffled array.
 * Makes an internal copy of the array to avoid modifying the original.
 */
export function shuffle<T>(array: T[]) {
  // Copy the original array to avoid modifying it
  let copiedArray = array.slice();

  // Fisher-Yates Shuffle
  for (let i = copiedArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]]; // Swap elements
  }

  return copiedArray;
}

export function randomTieredSystems(
  availableSystems: number[],
  { minAlphaWormholes = 0, minBetaWormholes = 0, minLegendary = 0 },
) {
  // TODO: Remove 'as' casting
  const tieredSystems = getTieredSystems(availableSystems) as TieredSystems;

  // Get the initial set, before promoting anything.
  const remainingSystems: TieredSystems = shuffleTieredSystems(tieredSystems);
  const chosenSystems = {
    high: [],
    med: [],
    low: [],
    red: [],
  };

  sampleAndPromoteSystems(
    minAlphaWormholes,
    remainingSystems,
    chosenSystems,
    (system) => system.wormhole === "ALPHA",
  );
  sampleAndPromoteSystems(
    minBetaWormholes,
    remainingSystems,
    chosenSystems,
    (system) => system.wormhole === "BETA",
  );

  sampleAndPromoteSystems(
    minLegendary,
    remainingSystems,
    chosenSystems,
    isLegendary,
  );

  // Return shuffled version of everything.
  return {
    chosenTiles: shuffleTieredSystems(chosenSystems),
    remainingTiles: shuffleTieredSystems(remainingSystems),
  };
}

function sampleAndPromoteSystems(
  sampleCount: number,
  remainingSystems: TieredSystems,
  chosenSystems: TieredSystems,
  filter: (system: System) => boolean,
) {
  let chosenCount = filterTieredSystems(chosenSystems, filter).length;
  let remainingTiles = filterTieredSystems(remainingSystems, filter);
  remainingTiles = shuffle(remainingTiles);
  while (chosenCount < sampleCount && remainingTiles.length > 0) {
    const system = remainingTiles.pop()!!;
    promote(system, chosenSystems, remainingSystems);
    chosenCount += 1;
  }
}

const shuffleTieredSystems = (tieredSystems: TieredSystems) => ({
  high: shuffle(tieredSystems.high),
  med: shuffle(tieredSystems.med),
  low: shuffle(tieredSystems.low),
  red: shuffle(tieredSystems.red),
});

const isLegendary = (system: System) =>
  !!system.planets.find((p) => p.legendary);

function filterTieredSystems(
  tieredSystems: TieredSystems,
  filter: (system: System) => boolean,
) {
  const matchingSystems: number[] = [];
  const runForTier = (systems: number[]) => {
    for (let i = 0; i < systems.length; i++) {
      const s = systems[i];
      const system = systemData[s];
      if (!system) throw new Error(`no system for tile ${s}`);
      if (filter(system)) matchingSystems.push(s);
    }
  };
  runForTier(tieredSystems.high);
  runForTier(tieredSystems.med);
  runForTier(tieredSystems.low);
  runForTier(tieredSystems.red);
  return matchingSystems;
}

function promote(
  system: number,
  chosenSystems: TieredSystems,
  remainingSystems: TieredSystems,
) {
  const runForTier = (
    system: number,
    dstArray: number[],
    srcArray: number[],
  ) => {
    const srcIdx = srcArray.indexOf(system);
    if (srcIdx >= 0) {
      srcArray.splice(srcIdx, 1); // remove from src
      dstArray.unshift(system); // add to front of dst
    }
  };
  runForTier(system, chosenSystems.high, remainingSystems.high);
  runForTier(system, chosenSystems.med, remainingSystems.med);
  runForTier(system, chosenSystems.low, remainingSystems.low);
  runForTier(system, chosenSystems.red, remainingSystems.red);
}

/**
 * Spread the required tiles (wormholes and legendaries) across slices.
 *
 * The "tieredSlices" have HIGH/MED/LOW/RED values.
 */
export function fillSlicesWithRequiredTiles(
  tieredSlices: TieredSlice[],
  chosenSystems: TieredSystems,
  slices: number[][],
) {
  const numSlices = tieredSlices.length;
  const sliceLength = tieredSlices[0].length;

  // Spread already chosen tiles around.
  const tryAdd = (tierToAdd: ChoosableTier) => {
    // Find the slice with the fewest entries that will take this tier.
    let bestSliceIndex = undefined;
    let bestTileIndex = undefined;
    let bestCount = undefined;
    for (let sliceIndex = 0; sliceIndex < numSlices; sliceIndex++) {
      const tieredSlice = tieredSlices[sliceIndex];
      for (let tileIndex = 0; tileIndex < sliceLength; tileIndex++) {
        const tileTier = tieredSlice[tileIndex];
        // TODO: Understand when this would be added.
        if (tileTier !== tierToAdd) continue;

        const slice = slices[sliceIndex];
        const count = slice.length;
        if (bestCount === undefined || count < bestCount) {
          bestSliceIndex = sliceIndex;
          bestTileIndex = tileIndex;
          bestCount = count;
        }
      }
    }
    if (bestCount !== undefined) {
      const tieredSlice = tieredSlices[bestSliceIndex!!];
      const slice = slices[bestSliceIndex!!];

      // TODO: But WHY double-check....
      // Double check correct tier.
      const tileTier = tieredSlice[bestTileIndex!!];
      if (tileTier !== tierToAdd) return false;

      // Move tile to slice.
      const system = chosenSystems[tierToAdd].pop()!!;

      slice.push(system);
      tieredSlice[bestTileIndex!!] = "resolved";
      return true;
    }
    return false;
  };

  while (chosenSystems.high.length > 0) {
    if (!tryAdd("high")) break;
  }
  while (chosenSystems.med.length > 0) {
    if (!tryAdd("med")) break;
  }
  while (chosenSystems.low.length > 0) {
    if (!tryAdd("low")) break;
  }
  while (chosenSystems.red.length > 0) {
    if (!tryAdd("red")) break;
  }
}

export function fillSlicesWithRemainingTiles(
  tieredSlices: TieredSlice[],
  remainingSystems: TieredSystems,
  slices: number[][],
) {
  const sliceLength = tieredSlices[0].length;

  // Fill red tiles randomly, do not account for res/inf (otherwise would
  // pull in those systems more frequencly than others).
  for (let tileIdx = 0; tileIdx < sliceLength; tileIdx++) {
    for (let sliceIdx = 0; sliceIdx < tieredSlices.length; sliceIdx++) {
      const tieredSlice = tieredSlices[sliceIdx];
      const tier = tieredSlice[tileIdx];
      if (tier !== "red") continue;

      let takeFrom = remainingSystems.red;
      if (takeFrom.length === 0) {
        if (remainingSystems.low.length > 0) {
          takeFrom = remainingSystems.low;
        } else if (remainingSystems.med.length > 0) {
          takeFrom = remainingSystems.med;
        } else if (remainingSystems.high.length > 0) {
          takeFrom = remainingSystems.high;
        } else if (remainingSystems.red.length > 0) {
          takeFrom = remainingSystems.red;
        } else {
          throw new Error("no tiles remain???");
        }
      }
      const system = takeFrom.pop()!!;
      const slice = slices[sliceIdx];
      slice.push(system);
      tieredSlice[tileIdx] = "resolved";
    }
  }

  // Fill rest with remaining tiles.
  // Use weighted selection to try to balance things.
  for (let tileIdx = 0; tileIdx < sliceLength; tileIdx++) {
    for (let sliceIdx = 0; sliceIdx < tieredSlices.length; sliceIdx++) {
      const tieredSlice = tieredSlices[sliceIdx];
      const tier = tieredSlice[tileIdx];
      if (tier === "resolved") continue;

      // We need to fill the slice.  If no tiles remain in the desired
      // tier, select a different one with availability.
      let takeFrom = remainingSystems[tier];
      if (!takeFrom)
        throw new Error(`no takeFrom for "${tier}" (tile index ${tileIdx})`);
      if (takeFrom.length === 0) {
        if (remainingSystems.low.length > 0) {
          takeFrom = remainingSystems.low;
        } else if (remainingSystems.med.length > 0) {
          takeFrom = remainingSystems.med;
        } else if (remainingSystems.high.length > 0) {
          takeFrom = remainingSystems.high;
        } else if (remainingSystems.red.length > 0) {
          takeFrom = remainingSystems.red;
        } else {
          throw new Error("no tiles remain???");
        }
      }

      const slice = slices[sliceIdx];

      const choices = [];
      for (
        let takeFromIndex = 0;
        takeFromIndex < takeFrom.length;
        takeFromIndex++
      ) {
        const system = takeFrom[takeFromIndex];
        const weight = calculateSliceScore(slice, system);
        choices.push({ weight, value: { system, takeFromIndex } });
      }

      // Move the chosen tile to the slice.
      const { system, takeFromIndex } = weightedChoice(choices);
      takeFrom.splice(takeFromIndex, 1);
      slice.push(system);
      tieredSlice[tileIdx] = "resolved";
    }
  }
}

function calculateSliceScore(sliceSoFar: number[], withNewSystem: number) {
  // Consider a slice with the new tile added.
  const slice = [...sliceSoFar];
  slice.push(withNewSystem);

  const { optInf, optRes, wormholes, legendaries } = summarizeRaw(slice);
  const avgOptInf = optInf / slice.length;
  const avgOptRes = optRes / slice.length;

  // Avoid multi-wormhole systems.
  if (wormholes.length > 1) {
    return 0.001;
  }

  // Avoid multi-legendary systems.
  if (legendaries.length > 1) {
    return 0.001;
  }

  // Milty draft requires:
  // - mininf = 4.0,
  // - minres = 2.5,
  // - mintot = 9.0,
  // - maxtot = 13.0
  const minAvgOptInf = 4 / 5;
  const minAvgOptRes = 2.5 / 5;
  const minAvgTot = 9 / 5;
  const maxAvgTot = 13 / 5;
  const targetOptInf = 1.354; // 4/(4+2.5)*11/5
  const targetOptRes = 0.846; // 2.5/(4+2.5)*11/5

  const weightMinInf = Math.min(1, avgOptInf / minAvgOptInf);
  const weightMinRes = Math.min(1, avgOptRes / minAvgOptRes);
  const weightMinTot = Math.min(1, (avgOptInf + avgOptRes) / minAvgTot);

  const weightMaxTot = avgOptInf + avgOptRes > maxAvgTot ? 0.001 : 1;

  const weightTargetInf = 1 / (Math.abs(avgOptInf - targetOptInf) + 1);
  const weightTargetRes = 1 / (Math.abs(avgOptRes - targetOptRes) + 1);

  const score =
    100 *
    weightMinInf *
    weightMinRes *
    weightMinTot *
    weightMaxTot *
    weightTargetInf *
    weightTargetRes;

  if (DEBUG_SLICE_SCORING) {
    console.log(
      JSON.stringify({
        avgOptInf,
        avgOptRes,

        weightMinInf,
        weightMinRes,
        weightMinTot,

        weightTargetInf,
        weightTargetRes,

        score,
      }),
    );
  }

  return score;
}

function summarizeRaw(systems: number[]) {
  let res = 0;
  let optRes = 0;
  let inf = 0;
  let optInf = 0;
  let tech = [];
  let traits = [];
  let wormholes = [];
  let legendaries = [];

  for (const id of systems) {
    const system = systemData[id];
    for (const planet of system.planets) {
      const r = planet.resources;
      const i = planet.influence;
      res += r;
      inf += i;
      if (r > i) {
        optRes += r;
      } else if (r < i) {
        optInf += i;
      } else {
        optRes += r / 2;
        optInf += i / 2;
      }
      if (planet.techSpecialty) {
        // for (const planetTech of planet.raw.tech) {
        tech.push(planet.techSpecialty.substring(0, 1).toUpperCase());
        // }
      }
      if (planet.trait) {
        // for (const planetTrait of planet.raw.trait) {
        traits.push(planet.trait.substring(0, 1).toUpperCase());
        // }
      }
      if (planet.legendary) {
        legendaries.push("L");
      }
    }
    // for (const wormhole of system.wormholes) {
    switch (system.wormhole) {
      case "ALPHA":
        wormholes.push("α");
        break;
      case "BETA":
        wormholes.push("β");
        break;
      case "GAMMA":
        wormholes.push("γ");
        break;
      case "DELTA":
        wormholes.push("δ");
        break;
    }
    // }
  }

  return {
    res,
    optRes,
    inf,
    optInf,
    tech,
    traits,
    wormholes,
    legendaries,
  };
}

export function separateAnomalies(origSlice: number[], shape: string[]) {
  let slice = [...origSlice]; // work with a copy

  // First, shuffle a few times and see if we get a good setup.
  // Give up after a reasonable number of tries.
  for (let i = 0; i < 20; i++) {
    if (!hasAdjacentAnomalies(slice, shape)) return slice;
    slice = shuffle(slice);
  }

  // No luck.  Walk through slice permutations and use the first good one.
  // (This always fixes the same way, hence a few random stabs before this.)
  const inspector = (candidate: number[]) => {
    return !hasAdjacentAnomalies(candidate, shape);
  };
  const goodSlice = permutator(slice, inspector);
  if (goodSlice) {
    slice = goodSlice;
  }

  return slice;
}

function hasAdjacentAnomalies(slice: number[], shape: string[]) {
  const hexIsAnomalySet = new Set();
  for (let i = 0; i < slice.length; i++) {
    const hex = shape[i + 1]; // first is home system
    const system = systemData[slice[i]];
    if (system && !!system.anomaly) {
      hexIsAnomalySet.add(hex);
    }
  }
  for (const hex of shape) {
    if (!hexIsAnomalySet.has(hex)) {
      continue;
    }
    for (const adj of neighbors(hex)) {
      if (hexIsAnomalySet.has(adj)) {
        return true;
      }
    }
  }
}

/**
 * Walk all permutations of an array, calling inspector for each.
 * Stop and return first permutation that gets a truthy inspector result.
 *
 * @param {Array.{x}} array
 * @param {function} inspector - takes permuted array, return true to use it
 * @returns {x} Array element
 */
function permutator<T>(array: T[], inspector: (arg: T[]) => boolean) {
  // https://stackoverflow.com/questions/9960908/permutations-in-javascript
  let result: T[] | undefined = undefined;
  const permute = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      const success = inspector(m);
      if (success) {
        result = m;
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
        // Stop after first success.
        if (result) {
          break;
        }
      }
    }
  };
  permute(array);
  return result;
}
