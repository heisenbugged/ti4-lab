import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "../draftConfig";
import { shuffle, weightedChoice } from "../helpers/randomization";
import { systemData } from "~/data/systemData";
import { ChoosableTier, SliceChoice, TieredSlice } from "../types";
import { calculateTier, getTieredSystems } from "../tieredSystems";
import {
  chooseRequiredSystems,
  fillSlicesWithRemainingTiles,
  fillSlicesWithRequiredTiles,
} from "../helpers/sliceGeneration";

const MAP_WORMHOLES = [
  { weight: 3, value: { numAlphas: 3, numBetas: 2 } },
  { weight: 3, value: { numAlphas: 2, numBetas: 0 } },
  { weight: 3, value: { numAlphas: 0, numBetas: 2 } },
  { weight: 2, value: { numAlphas: 3, numBetas: 0 } },
  { weight: 2, value: { numAlphas: 0, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 1, numBetas: 1 } },
];

const MAP_LEGENDARIES = [
  { weight: 1, value: 0 },
  { weight: 1, value: 1 },
  { weight: 1, value: 2 },
];

const ALL_WORMHOLES = [
  { weight: 1, value: { numAlphas: 3, numBetas: 2 } },
  { weight: 1, value: { numAlphas: 2, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 3, numBetas: 3 } },
];

const ALL_LEGENDARIES = [
  { weight: 1, value: 1 },
  { weight: 2, value: 2 },
];

const SLICE_CHOICES: SliceChoice[] = [
  { weight: 1, value: ["red", "high", "high"] },
  { weight: 3, value: ["red", "high", "med"] },
  { weight: 3, value: ["red", "med", "med"] },
  { weight: 2, value: ["red", "med", "low"] },
  { weight: 1, value: ["red", "low", "low"] },
];

export function generateMap(sliceCount: number, availableSystems: number[]) {
  const chosenSpots: Record<number, number> = {};

  const { numAlphas: totalNumAlphas, numBetas: totalNumBetas } =
    weightedChoice(ALL_WORMHOLES);
  const totalNumLegendaries = weightedChoice(ALL_LEGENDARIES);

  const { numAlphas, numBetas } = weightedChoice(MAP_WORMHOLES);
  const numLegendaries = weightedChoice(MAP_LEGENDARIES);

  const alphaWormholes = shuffle(
    availableSystems.filter((id) => systemData[id].wormholes.includes("ALPHA")),
  );

  const betaWormholes = shuffle(
    availableSystems.filter((id) => systemData[id].wormholes.includes("BETA")),
  );

  const legendaries = shuffle(
    availableSystems.filter(
      (id) => !!systemData[id].planets.find((p) => p.legendary),
    ),
  );

  const tileLocations = shuffle(
    draftConfig.heisen.modifiableMapTiles.map((idx) => ({
      mapIdx: idx - 1,
      position: mapStringOrder[idx],
    })),
  );

  const alphaSpots = distributeByDistance(
    tileLocations,
    alphaWormholes,
    numAlphas,
  );

  const betaSpots = distributeByDistance(
    tileLocations,
    betaWormholes,
    numBetas,
  );

  const legendarySpots = distributeByDistance(
    tileLocations,
    legendaries,
    numLegendaries,
  );

  // promote found tiles to chosenSpots
  alphaSpots.forEach(
    ({ location, systemId }) => (chosenSpots[location.mapIdx] = systemId),
  );
  betaSpots.forEach(
    ({ location, systemId }) => (chosenSpots[location.mapIdx] = systemId),
  );

  legendarySpots.forEach(
    ({ location, systemId }) => (chosenSpots[location.mapIdx] = systemId),
  );

  const chosenSystems = Object.values(chosenSpots);

  // we get remaining systems and sort by tiers to fill the rest of the map.
  // we exclude remaining legendaries and wormho toles as these will get placed in the slices.
  const tiered = getTieredSystems(
    availableSystems.filter(
      (id) =>
        !chosenSystems.includes(id) &&
        !legendaries.includes(id) &&
        !alphaWormholes.includes(id) &&
        !betaWormholes.includes(id),
    ),
  );
  const remainingSystems = {
    red: shuffle(tiered.red),
    high: shuffle(tiered.high),
    med: shuffle(tiered.med),
    low: shuffle(tiered.low),
  };

  // PART 2:
  function fillSlice(slice: number[]) {
    const sliceTiers = shuffle(weightedChoice(SLICE_CHOICES));
    // Remove already chosen spots (from previous 'fill') from the available tiers.
    slice
      .filter((idx) => chosenSpots[idx])
      .forEach((idx) => {
        const systemId = chosenSpots[idx];
        const tier = calculateTier(systemData[systemId]) as ChoosableTier;

        // remove the tier from the sliceTiers
        // but if there is not a matching 'tier', then we remove the closest match
        const closestTier = pickClosestTier(tier, sliceTiers);

        // remove the matched tier.
        sliceTiers.splice(sliceTiers.indexOf(closestTier), 1);
      });

    // Fill in remaining tiers in the slice
    slice
      .filter((idx) => !chosenSpots[idx])
      .forEach((idx) => {
        // TODO: how to deal with not enough systems?
        // realistically should not happen if generating the whole map.
        const tier = sliceTiers.pop()!!;
        const candidate = remainingSystems[tier].pop()!!;
        chosenSpots[idx] = candidate;
      });
  }

  // fill inner slices
  fillSlice([0, 7, 17]);
  fillSlice([1, 7, 9]);
  fillSlice([2, 9, 11]);
  fillSlice([3, 11, 13]);
  fillSlice([4, 13, 15]);
  fillSlice([5, 15, 17]);

  // calculate remaining alphas, betas, and wormholes to fill in slices
  // considering the ones put on the map
  const remainingAlphas = Math.max(totalNumAlphas - numAlphas, 0);
  const remainingBetas = Math.max(totalNumBetas - numBetas, 0);
  const remainingLegendaries = Math.max(
    totalNumLegendaries - numLegendaries,
    0,
  );

  // generate slices
  const slices = generateSlices(
    sliceCount,
    availableSystems.filter((id) => !chosenSystems.includes(id)),
    remainingAlphas,
    remainingBetas,
    remainingLegendaries,
  );

  return {
    chosenSpots,
    slices,
  };
}

const tierOrder: Record<ChoosableTier, number> = {
  red: 0,
  low: 1,
  med: 2,
  high: 3,
};

export function generateSlices(
  sliceCount: number,
  availableSystems: number[],
  minAlphaWormholes: number = 0,
  minBetaWormholes: number = 0,
  minLegendary: number = 0,
) {
  const tieredSlices: TieredSlice[] = [];
  for (let i = 0; i < sliceCount; i++) {
    const tierValues = shuffle(weightedChoice(SLICE_CHOICES));
    tieredSlices.push(tierValues);
  }

  // Enforce a minimum number of wormholes and legendary planets
  const { chosenTiles, remainingTiles } = chooseRequiredSystems(
    availableSystems,
    {
      minAlphaWormholes,
      minBetaWormholes,
      minLegendary,
    },
  );

  // distirbute the wormholes/legendaries in round robin fashion
  // on the slices.
  const slices: number[][] = Array.from({ length: sliceCount }, () => []);
  fillSlicesWithRequiredTiles(tieredSlices, chosenTiles, slices);

  // fill slices with remaining tiles, respecting the 'tier' requirements
  // of the spots in each slice.
  fillSlicesWithRemainingTiles(tieredSlices, remainingTiles, slices);

  return slices;
}

/**
 * Picks the closest tier to the given tier from the sliceTiers.
 */
const pickClosestTier = (tier: ChoosableTier, sliceTiers: ChoosableTier[]) =>
  [...sliceTiers].sort(
    (a, b) =>
      Math.abs(tierOrder[a] - tierOrder[tier]) -
      Math.abs(tierOrder[b] - tierOrder[tier]),
  )[0];

type Location = { mapIdx: number; position: { x: number; y: number } };

function distributeByDistance(
  availableLocations: Location[],
  availableSystems: number[],
  numSpots: number,
  minDistance: number = 3,
) {
  let chosen: { location: Location; systemId: number }[] = [];

  for (let i = 0; i < numSpots; i++) {
    // First tile gets placed randomly on any spot.
    if (i === 0) {
      const location = availableLocations.pop()!!;
      chosen.push({ location, systemId: availableSystems.pop()!! });
      continue;
    }

    // Loop through all other available locations
    // compute the distance to all the already chosen locations,
    // where the distance is the distance to the closest chosen location.
    let sortedLocations = availableLocations
      .map((candidate) => ({
        location: candidate,
        minDistance: Math.min(
          ...chosen.map((c) =>
            axialDistance(c.location.position, candidate.position),
          ),
        ),
      }))
      .sort((a, b) => a.minDistance - b.minDistance);

    // Get a location with distance >= minDistance,
    // or the furthest away if there is no such location.
    const chosenLocation =
      sortedLocations.find((d) => d.minDistance >= minDistance)?.location ??
      sortedLocations.pop()!!.location;

    // remove the location from the list of available locations
    availableLocations.splice(availableLocations.indexOf(chosenLocation), 1);

    // Add chosen tile to the list of chosen tiles.
    chosen.push({
      location: chosenLocation,
      systemId: availableSystems.pop()!!,
    });
  }

  return chosen;
}

type Axial = { x: number; y: number };
type Cube = { q: number; r: number; s: number };

function axialToCube(axial: Axial): Cube {
  const q = axial.x;
  const r = axial.y;
  const s = -q - r;
  return { q, r, s };
}

function axialDistance(a: Axial, b: Axial) {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return cubeDistance(ac, bc);
}

function cubeSubtract(a: Cube, b: Cube): Cube {
  return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s };
}

function cubeDistance(a: Cube, b: Cube) {
  const vec = cubeSubtract(a, b);
  return Math.max(Math.abs(vec.q), Math.abs(vec.r), Math.abs(vec.s));
}
