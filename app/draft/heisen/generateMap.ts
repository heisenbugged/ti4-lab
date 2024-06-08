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
import { PlanetTrait } from "~/types";

const MAP_WORMHOLES = [
  { weight: 1, value: { numAlphas: 3, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 3, numBetas: 2 } },
  { weight: 1, value: { numAlphas: 2, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 3, numBetas: 1 } },
  { weight: 1, value: { numAlphas: 1, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 2, numBetas: 2 } },
  { weight: 1, value: { numAlphas: 3, numBetas: 0 } },
  { weight: 1, value: { numAlphas: 0, numBetas: 3 } },
  { weight: 1, value: { numAlphas: 2, numBetas: 1 } },
  { weight: 1, value: { numAlphas: 1, numBetas: 2 } },
  { weight: 1, value: { numAlphas: 2, numBetas: 0 } },
  { weight: 1, value: { numAlphas: 0, numBetas: 2 } },
  { weight: 1, value: { numAlphas: 1, numBetas: 1 } },
  { weight: 1, value: { numAlphas: 0, numBetas: 1 } },
  { weight: 1, value: { numAlphas: 1, numBetas: 0 } },
  { weight: 1, value: { numAlphas: 0, numBetas: 0 } },
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
  { weight: 1, value: ["red", "high", "med"] },
  { weight: 1, value: ["red", "med", "med"] },
  { weight: 1, value: ["red", "med", "low"] },
  { weight: 1, value: ["red", "low", "low"] },
  { weight: 1, value: ["red", "low", "high"] },
];

export function generateMap(sliceCount: number, systemPool: number[]) {
  // TODO: Scale if more slices.
  const targets: Record<ChoosableTier, number> = {
    high: 6,
    med: 6,
    low: 6,
    red: 12,
  };

  console.log("slice count is", sliceCount);
  // if we have more than 6 slices, we boost the 'targets'
  for (let i = 6; i < sliceCount; i++) {
    console.log("boosting");
    const slice = weightedChoice(SLICE_CHOICES);
    slice.forEach((tier) => (targets[tier] += 1));
  }

  const chosenMapLocations: Record<number, number> = {};
  let chosenSliceSystems: number[] = [];

  const remainingSystems = () => {
    const chosenMap = Object.values(chosenMapLocations);
    return systemPool.filter(
      (id) => !chosenMap.includes(id) && !chosenSliceSystems.includes(id),
    );
  };
  const usedSystems = () => {
    const remaining = remainingSystems();
    return systemPool.filter((id) => !remaining.includes(id));
  };

  const { numAlphas: totalNumAlphas, numBetas: totalNumBetas } =
    weightedChoice(ALL_WORMHOLES);
  const totalNumLegendaries = weightedChoice(ALL_LEGENDARIES);

  const { numAlphas, numBetas } = weightedChoice(MAP_WORMHOLES);
  const numLegendaries = weightedChoice(MAP_LEGENDARIES);

  // --------------------------------------------------
  // Step 1: Distribute alphas/betas/legendaries on map.
  // --------------------------------------------------
  const alphas = shuffle(
    systemPool.filter((id) => systemData[id].wormholes.includes("ALPHA")),
  );

  const betas = shuffle(
    systemPool.filter((id) => systemData[id].wormholes.includes("BETA")),
  );

  const legendaries = shuffle(
    systemPool.filter(
      (id) => !!systemData[id].planets.find((p) => p.legendary),
    ),
  );

  const tileLocations = shuffle(
    draftConfig.heisen.modifiableMapTiles.map((idx) => ({
      mapIdx: idx - 1,
      position: mapStringOrder[idx],
    })),
  );

  const alphaSpots = distributeByDistance(tileLocations, alphas, numAlphas);
  const betaSpots = distributeByDistance(tileLocations, betas, numBetas);
  const legendarySpots = distributeByDistance(
    tileLocations,
    legendaries,
    numLegendaries,
  );

  // promote found tiles to chosenSpots
  alphaSpots.forEach(
    ({ location, systemId }) =>
      (chosenMapLocations[location.mapIdx] = systemId),
  );
  betaSpots.forEach(
    ({ location, systemId }) =>
      (chosenMapLocations[location.mapIdx] = systemId),
  );

  legendarySpots.forEach(
    ({ location, systemId }) =>
      (chosenMapLocations[location.mapIdx] = systemId),
  );

  // calculate remaining alphas, betas, and wormholes to fill in slices
  // considering the ones put on the map
  const remainingAlphas = Math.max(totalNumAlphas - numAlphas, 0);
  const remainingBetas = Math.max(totalNumBetas - numBetas, 0);
  const remainingLegendaries = Math.max(
    totalNumLegendaries - numLegendaries,
    0,
  );

  // ---------------------------------------------------------------------------------
  // Step 2: Generate slices, distributing remaining alphas/betas/legendaries equally
  // ---------------------------------------------------------------------------------
  const slices = generateSlices(
    sliceCount,
    remainingSystems(),
    remainingAlphas,
    remainingBetas,
    remainingLegendaries,
  );
  // promote the chosen slice systems.
  chosenSliceSystems = slices.flat(1);

  // Adjust targets by chosen systems
  usedSystems().forEach((id) => {
    const tier = calculateTier(systemData[id]) as ChoosableTier; // Unsafe typecast.
    targets[tier] = Math.max(targets[tier] - 1, 0);
  });

  // categorize remaining systems into tiers
  const tieredSystems = getTieredSystems(remainingSystems());

  // Select random target number of low/med/high systems,
  // and then shuffle.
  let systemsToPullFrom = shuffle(
    [
      ...shuffle(tieredSystems.low).slice(0, targets.low),
      ...shuffle(tieredSystems.med).slice(0, targets.med),
      ...shuffle(tieredSystems.high).slice(0, targets.high),
      ...shuffle(tieredSystems.red).slice(0, targets.red),
    ].flat(1),
  );

  // ------------------------------------------------
  // Step 3: Distribute remaining systems on the map.
  // ------------------------------------------------
  tileLocations.forEach((location) => {
    chosenMapLocations[location.mapIdx] = systemsToPullFrom.pop()!;
  });

  // ------------------------------------------------
  // Step 4: Adjust to balance planet traits
  // ------------------------------------------------
  // since we fix a number of wormholes and legendaries, this biases
  // the random sampling towards blue/red planets. we do some post-processing
  // to ensure that the distribution of planet traits is more balanced.
  const { swaps } = rebalanceTraits(usedSystems(), remainingSystems());
  swaps.forEach(({ toRemove, toAdd }) => {
    // swap on map, if on map
    const idx = Object.values(chosenMapLocations).indexOf(toRemove);
    if (idx !== -1) {
      const mapIdx = Object.keys(chosenMapLocations)[idx];
      chosenMapLocations[Number(mapIdx)] = toAdd;
      return;
    }

    // swap on slices, if in slices
    const sliceIdx = slices.findIndex((slice) => slice.includes(toRemove));
    if (sliceIdx !== -1) {
      const systemIdx = slices[sliceIdx].indexOf(toRemove);
      slices[sliceIdx][systemIdx] = toAdd;
      return;
    }
  });

  return {
    chosenSpots: chosenMapLocations,
    // lastly, jumble up the slices
    slices: slices.map((slice) => shuffle(slice)),
  };
}

type Swap = { toRemove: number; toAdd: number };
const rebalanceTraits = (
  usedSystems: number[],
  availableSystems: number[],
  swaps: Swap[] = [],
  attempts: number = 0,
  maxAttempts: number = 10,
): { swaps: Swap[] } => {
  const planetTraits = countPlanetTraits(usedSystems);
  const { spread, maxTrait, minTrait } = calculateSpread(planetTraits);
  if (spread < 5 || attempts >= maxAttempts) return { swaps };

  const candidateToRemove = usedSystems
    .filter((id) =>
      systemData[id].planets.find(({ trait }) => trait === maxTrait),
    )
    .sort(
      (a, b) =>
        systemData[b].planets.filter(({ trait }) => trait === maxTrait).length -
        systemData[a].planets.filter(({ trait }) => trait === maxTrait).length,
    )[0];

  if (!candidateToRemove) return { swaps };

  // find a planet with the desired trait
  const candidateToAdd = availableSystems.find(
    (id) =>
      systemData[id].planets.find(({ trait }) => trait === minTrait) &&
      systemData[id].planets.length ===
        systemData[candidateToRemove].planets.length,
  )!;

  if (!candidateToAdd) return { swaps };

  // modify 'used' and 'available' systems
  usedSystems = usedSystems.filter((id) => id !== candidateToRemove);
  usedSystems.push(candidateToAdd);

  availableSystems = availableSystems.filter((id) => id !== candidateToAdd);
  availableSystems.push(candidateToRemove);

  swaps.push({ toRemove: candidateToRemove, toAdd: candidateToAdd });
  return rebalanceTraits(usedSystems, availableSystems, swaps, attempts + 1);
};

/**
 * Given a count of planet traits, calculate the spread between the highest and lowest trait.
 */
const calculateSpread = (planetTraits: Record<PlanetTrait, number>) => {
  const traitValues = Object.values(planetTraits);
  const maxTrait = Object.keys(planetTraits).find(
    (trait) => planetTraits[trait as PlanetTrait] === Math.max(...traitValues),
  ) as PlanetTrait;
  const minTrait = Object.keys(planetTraits).find(
    (trait) => planetTraits[trait as PlanetTrait] === Math.min(...traitValues),
  ) as PlanetTrait;
  const spread = Math.max(...traitValues) - Math.min(...traitValues);

  return { spread, maxTrait, minTrait };
};

/**
 * Count the number of planet traits in the used systems.
 */
const countPlanetTraits = (used: number[]) => {
  const planetTraits: Record<PlanetTrait, number> = {
    HAZARDOUS: 0,
    CULTURAL: 0,
    INDUSTRIAL: 0,
  };

  used.forEach((id) => {
    systemData[id].planets.forEach(({ trait }) => {
      if (trait) planetTraits[trait] += 1;
    });
  });

  return planetTraits;
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

/**
 * Picks the closest tier to the given tier from the sliceTiers.
 */
const tierOrder: Record<ChoosableTier, number> = {
  red: 0,
  low: 1,
  med: 2,
  high: 3,
};
const pickClosestTier = (tier: ChoosableTier, sliceTiers: ChoosableTier[]) =>
  [...sliceTiers].sort(
    (a, b) =>
      Math.abs(tierOrder[a] - tierOrder[tier]) -
      Math.abs(tierOrder[b] - tierOrder[tier]),
  )[0];
