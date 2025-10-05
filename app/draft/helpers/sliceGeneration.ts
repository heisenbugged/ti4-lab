/**
 * NOTE: CODE PORTED FROM TTPG.
 * @link https://github.com/TI4-Online/TI4-TTPG/blob/main/src/lib/draft/abstract/abstract-slice-generator.js
 * Has been adapted to 'typescript' and minor modifications to better fit
 * with the aesthetic of this project, but largely unchanged.
 */
import { SystemIds, System, SystemId } from "~/types";
import { systemData } from "~/data/systemData";
import { ChoosableTier, TieredSlice, TieredSystems } from "../types";
import { neighbors } from "../hex";
import { shuffle, weightedChoice } from "./randomization";

const DEBUG_SLICE_SCORING = false;

/**
 * Gives shuffled systems, and then promotes systems to the chosenSystems
 * array based on the minimums provided.
 */
export function chooseRequiredSystems(
  availableSystems: SystemId[],
  { minAlphaWormholes = 0, minBetaWormholes = 0, minLegendary = 0 },
) {
  // Get the initial set, before selecting anything
  const remainingSystems = shuffle([...availableSystems]);
  const chosenSystems: SystemId[] = [];

  sampleAndPromoteSystems(
    minAlphaWormholes,
    remainingSystems,
    chosenSystems,
    isAlpha,
  );
  sampleAndPromoteSystems(
    minBetaWormholes,
    remainingSystems,
    chosenSystems,
    isBeta,
  );
  sampleAndPromoteSystems(
    minLegendary,
    remainingSystems,
    chosenSystems,
    isLegendary,
  );

  // Return shuffled version of everything
  return {
    chosenTiles: shuffle([...chosenSystems]),
    remainingTiles: shuffle([...remainingSystems]),
  };
}

function sampleAndPromoteSystems(
  sampleCount: number,
  remainingSystems: SystemId[],
  chosenSystems: SystemId[],
  filter: (system: System) => boolean,
) {
  let chosenCount = chosenSystems.filter((id) => filter(systemData[id])).length;
  let matchingSystems = remainingSystems.filter((id) => filter(systemData[id]));
  matchingSystems = shuffle(matchingSystems);

  while (chosenCount < sampleCount && matchingSystems.length > 0) {
    const system = matchingSystems.pop()!;
    const index = remainingSystems.indexOf(system);
    if (index !== -1) {
      remainingSystems.splice(index, 1);
      chosenSystems.push(system);
      chosenCount += 1;
    }
  }
}

export const shuffleTieredSystems = (tieredSystems: TieredSystems) => ({
  high: shuffle(tieredSystems.high),
  med: shuffle(tieredSystems.med),
  low: shuffle(tieredSystems.low),
  red: shuffle(tieredSystems.red),
});

export const isAlpha = (system: System) => system.wormholes.includes("ALPHA");
export const isBeta = (system: System) => system.wormholes.includes("BETA");
export const isLegendary = (system: System) =>
  !!system.planets.find((p) => p.legendary);

export function filterTieredSystems(
  tieredSystems: TieredSystems,
  filter: (system: System) => boolean,
) {
  const matchingSystems: SystemId[] = [];
  const runForTier = (systems: SystemId[]) => {
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

/**
 * Spread the required tiles (wormholes and legendaries) across slices.
 *
 * The "tieredSlices" have HIGH/MED/LOW/RED values.
 */
export function fillSlicesWithRequiredTiles(
  tieredSlices: TieredSlice[],
  chosenSystems: TieredSystems,
  slices: SystemIds[],
) {
  // Spread already chosen tiles around.
  const tryAdd = (tierToAdd: ChoosableTier) => {
    const candidates = tieredSlices.flatMap((tieredSlice, sliceIndex) =>
      tieredSlice.map((tileTier, tileIndex) => ({
        sliceIndex,
        tileIndex,
        count: slices[sliceIndex].length,
        tileTier,
      })),
    );
    type Candidate = (typeof candidates)[number];

    const bestCandidate = candidates
      .filter((candidate) => candidate.tileTier === tierToAdd)
      .reduce(
        (best, candidate) => {
          if (best === undefined || candidate.count < best.count)
            return candidate;
          return best;
        },
        undefined as Candidate | undefined,
      );

    if (bestCandidate && bestCandidate.tileTier === tierToAdd) {
      const { sliceIndex, tileIndex } = bestCandidate;
      const system = chosenSystems[tierToAdd].pop()!;
      slices[sliceIndex].push(system);
      tieredSlices[sliceIndex][tileIndex] = "resolved";
      return true;
    }
    return false;
  };

  (["high", "med", "low", "red"] as const).forEach((tier) => {
    while (chosenSystems[tier].length > 0) {
      if (!tryAdd(tier)) break;
    }
  });
}

export function fillSlicesWithRemainingTiles(
  tieredSlices: TieredSlice[],
  remainingSystems: TieredSystems,
  slices: SystemIds[],
) {
  const remainingTiers = [
    remainingSystems.low,
    remainingSystems.med,
    remainingSystems.high,
  ];

  // Fill red tiles randomly, do not account for res/inf (otherwise would
  // pull in those systems more frequently than others).
  tieredSlices.forEach((tieredSlice, sliceIdx) => {
    tieredSlice.forEach((tier, tileIdx) => {
      if (tier !== "red") return;

      // Find a tile to take.
      // Prefer red tiles, then low/med/high if no red available..
      const takeFrom =
        remainingSystems.red.length > 0
          ? remainingSystems.red
          : remainingTiers.find((arr) => arr.length > 0);

      if (!takeFrom) throw new Error("no tiles remain???");

      const system = takeFrom.pop()!;
      slices[sliceIdx].push(system);
      tieredSlice[tileIdx] = "resolved";
    });
  });

  // Fill rest with remaining tiles.
  // Use weighted selection to try to balance things.
  tieredSlices.forEach((tieredSlice, sliceIdx) => {
    tieredSlice.forEach((tier, tileIdx) => {
      if (tier === "resolved") return;

      const takeFrom =
        remainingSystems[tier].length > 0
          ? remainingSystems[tier]
          : remainingTiers.find((arr) => arr.length > 0);

      if (!takeFrom) throw new Error("no tiles remain???");

      const slice = slices[sliceIdx];
      const choices = takeFrom.map((system, takeFromIndex) => ({
        weight: calculateSliceScore(slice, system),
        value: { system, takeFromIndex },
      }));

      // Move the chosen tile to the slice.
      const { system, takeFromIndex } = weightedChoice(choices);
      takeFrom.splice(takeFromIndex, 1);
      slice.push(system);
      tieredSlice[tileIdx] = "resolved";
    });
  });
}

function calculateSliceScore(sliceSoFar: SystemId[], withNewSystem: SystemId) {
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

  const weights = [
    Math.min(1, avgOptInf / minAvgOptInf), // minInf
    Math.min(1, avgOptRes / minAvgOptRes), // minRes
    Math.min(1, (avgOptInf + avgOptRes) / minAvgTot), // minTot
    avgOptInf + avgOptRes > maxAvgTot ? 0.001 : 1, // maxTot
    1 / (Math.abs(avgOptInf - targetOptInf) + 1), // targetInf
    1 / (Math.abs(avgOptRes - targetOptRes) + 1), // targetRes
  ];
  const score = 100 * weights.reduce((acc, w) => acc * w, 1);

  if (DEBUG_SLICE_SCORING) {
    console.log(
      JSON.stringify({
        avgOptInf,
        avgOptRes,
        weights,
        score,
      }),
    );
  }

  return score;
}

function summarizeRaw(systems: SystemId[]) {
  let res = 0;
  let optRes = 0;
  let inf = 0;
  let optInf = 0;
  const tech = [];
  const traits = [];
  const wormholes = [];
  const legendaries = [];

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
      if (planet.tech) {
        for (const planetTech of planet.tech) {
          tech.push(planetTech.substring(0, 1).toUpperCase());
        }
      }
      if (planet.trait) {
        for (const planetTrait of planet.trait) {
          traits.push(planetTrait.substring(0, 1).toUpperCase());
        }
      }
      if (planet.legendary) {
        legendaries.push("L");
      }
    }
    for (const wormhole of system.wormholes) {
      switch (wormhole) {
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
    }
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

export function separateAnomalies(origSlice: SystemId[], shape: string[]) {
  let slice = [...origSlice]; // work with a copy

  // First, shuffle a few times and see if we get a good setup.
  // Give up after a reasonable number of tries.
  for (let i = 0; i < 20; i++) {
    if (!hasAdjacentAnomalies(slice, shape)) return slice;
    slice = shuffle(slice);
  }

  // No luck.  Walk through slice permutations and use the first good one.
  // (This always fixes the same way, hence a few random stabs before this.)
  const inspector = (candidate: SystemId[]) => {
    return !hasAdjacentAnomalies(candidate, shape);
  };
  const goodSlice = permutator(slice, inspector);
  if (goodSlice) {
    slice = goodSlice;
  }

  return slice;
}

function hasAdjacentAnomalies(slice: SystemId[], shape: string[]) {
  const hexIsAnomalySet = new Set();
  for (let i = 0; i < slice.length; i++) {
    const hex = shape[i + 1]; // first is home system
    const system = systemData[slice[i]];
    if (system && system.anomalies.length > 0) {
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
  return false;
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
        const curr = arr.slice();
        const next = curr.splice(i, 1);
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

export function groupSystemsByTier(
  systems: SystemId[],
  tiers: Record<string, ChoosableTier>,
): Record<ChoosableTier, SystemId[]> {
  return systems.reduce(
    (acc, id) => {
      const tier = tiers[id];
      if (acc[tier]) {
        acc[tier].push(id);
      } else {
        acc[tier] = [id];
      }
      return acc;
    },
    {} as Record<ChoosableTier, SystemId[]>,
  );
}
