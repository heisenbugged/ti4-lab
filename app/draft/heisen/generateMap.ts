import { mapStringOrder } from "~/data/mapStringOrder";
import { shuffle, weightedChoice } from "../helpers/randomization";
import { systemData } from "~/data/systemData";
import {
  ChoosableTier,
  SliceChoice,
  SliceGenerationConfig,
  TieredSlice,
} from "../types";
import { calculateTier, getTieredSystems } from "../tieredSystems";
import {
  chooseRequiredSystems,
  fillSlicesWithRemainingTiles,
  fillSlicesWithRequiredTiles,
} from "../helpers/sliceGeneration";
import {
  PlanetTrait,
  SystemIds,
  SystemId,
  DraftSettings,
  FactionId,
} from "~/types";
import { generateEmptyMap, optimalStatsForSystems } from "~/utils/map";
import { draftConfig } from "../draftConfig";
import { calculateMapStats } from "~/hooks/useFullMapStats";
import {
  getAdjacentPositions,
  hasAdjacentAnomalies,
} from "../common/sliceGenerator";

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

// NOTE: These indices are 0-based positions in the mapStringOrder array
// Define core slices - the slices adjacent to Mecatol Rex (index 0)
const CORE_SLICES = [
  [1, 18, 8], // 12 o'clock core
  [2, 10, 8], // 2 o'clock core
  [3, 12, 10], // 4 o'clock core
  [4, 14, 12], // 6 o'clock core
  [5, 16, 14], // 8 o'clock core
  [6, 16, 18], // 10 o'clock core
];

// Define the optimal value range for core slices
const CORE_SLICE_MIN_OPTIMAL = 4; // Minimum optimal value for a core slice
const CORE_SLICE_MAX_OPTIMAL = 8; // Maximum optimal value for a core slice
const MIN_RED_TILES = 11; // Minimum red tiles on the map

export function generateMap(
  settings: DraftSettings,
  systemPool: SystemId[],
  minorFactionPool?: FactionId[],
  attempts: number = 0,
) {
  const sliceCount = settings.numSlices;
  const config = draftConfig[settings.type];

  // a bit hacky, but works for now
  // this changes between heisen and heisen8p
  const targets: Record<ChoosableTier, number> =
    config.type === "heisen"
      ? {
          high: 6,
          med: 6,
          low: 6,
          red: 12,
        }
      : {
          high: 7,
          med: 8,
          low: 7,
          red: 15,
        };

  // if we have more than 6 slices, we boost the 'targets'
  for (let i = 6; i < sliceCount; i++) {
    const slice = weightedChoice(SLICE_CHOICES);
    slice.forEach((tier) => (targets[tier] += 1));
  }

  const chosenMapLocations: Record<number, SystemId> = {};
  let chosenSliceSystems: SystemId[] = [];

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
    config.modifiableMapTiles.map((idx) => ({
      mapIdx: idx,
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
  const slices = generateSlices(sliceCount, remainingSystems(), {
    numAlphas: remainingAlphas,
    numBetas: remainingBetas,
    minLegendaries: remainingLegendaries,
  });
  // promote the chosen slice systems.
  chosenSliceSystems = slices.flat(1);

  // Adjust targets by chosen systems
  usedSystems().forEach((id) => {
    const tier = calculateTier(systemData[id]) as ChoosableTier; // Unsafe typecast.
    targets[tier] = Math.max(targets[tier] - 1, 0);
  });

  // categorize remaining systems into tiers
  const tieredSystems = getTieredSystems(remainingSystems());

  // ---------------------------------------------------------------------------------
  // Step 3: Generate and balance the core slices around Mecatol Rex
  // ---------------------------------------------------------------------------------
  // Track which core slice positions are already occupied by alphas/betas/legendaries
  if (settings.type === "heisen") {
    const coreSlicePositions = CORE_SLICES.flat();
    const occupiedCorePositions: Record<number, SystemId> = {};

    coreSlicePositions.forEach((pos) => {
      if (chosenMapLocations[pos]) {
        occupiedCorePositions[pos] = chosenMapLocations[pos];
      }
    });

    // Define tier weightings for core slices using the same distribution as for player slices
    const coreSliceTiers: TieredSlice[] = [];
    for (let i = 0; i < 6; i++) {
      const tierValues = shuffle(weightedChoice(SLICE_CHOICES));
      coreSliceTiers.push(tierValues);
    }

    // Fill core slices with appropriate tier systems, avoiding adjacent anomalies
    fillCoreSlices(
      CORE_SLICES,
      coreSliceTiers,
      tieredSystems,
      chosenMapLocations,
      occupiedCorePositions,
      settings.sliceGenerationConfig?.entropicScarValue ?? 2,
    );
  }

  // Select random target number of low/med/high systems for the remaining tiles,
  // and then shuffle.
  const updatedTieredSystems = getTieredSystems(remainingSystems());
  const systemsToPullFrom = shuffle(
    [
      ...shuffle(updatedTieredSystems.low).slice(0, targets.low),
      ...shuffle(updatedTieredSystems.med).slice(0, targets.med),
      ...shuffle(updatedTieredSystems.high).slice(0, targets.high),
      ...shuffle(updatedTieredSystems.red).slice(0, targets.red),
    ].flat(1),
  );

  // ------------------------------------------------
  // Step 4: Distribute remaining systems on the map.
  // ------------------------------------------------
  tileLocations.forEach((location) => {
    if (!chosenMapLocations[location.mapIdx] && systemsToPullFrom.length > 0) {
      chosenMapLocations[location.mapIdx] = systemsToPullFrom.pop()!;
    }
  });

  // ------------------------------------------------
  // Step 5: Adjust to balance planet traits
  // ------------------------------------------------
  // since we fix a number of wormholes and legendaries, this biases
  // the random sampling towards blue/red planets. we do some post-processing
  // to ensure that the distribution of planet traits is more balanced.
  const { swaps } = rebalanceTraits(
    usedSystems(),
    remainingSystems(),
    [],
    0,
    10,
    chosenMapLocations,
  );
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

  const map = generateEmptyMap(config);
  Object.entries(chosenMapLocations).forEach(([mapIdx, systemId]) => {
    const existing = map[Number(mapIdx)];
    map[Number(mapIdx)] = {
      ...existing,
      type: "SYSTEM",
      systemId,
    };
  });

  // ------------------------------------------------
  // Step 6: Validate map and core slice balance
  // ------------------------------------------------
  if (settings.type === "heisen" && attempts <= 1000) {
    // Calculate min/max planets across all slices
    const planetCounts = slices.map((slice) =>
      slice.reduce(
        (sum, systemId) => sum + systemData[systemId].planets.length,
        0,
      ),
    );
    const minPlanets = Math.min(...planetCounts);
    const maxPlanets = Math.max(...planetCounts);

    const totalSpends = slices.map((s) => {
      const stats = optimalStatsForSystems(
        s.map((id) => systemData[id]),
        settings.sliceGenerationConfig?.entropicScarValue ?? 2,
      );
      return stats.resources + stats.influence + stats.flex;
    });
    const minTotalSpend = Math.min(...totalSpends);
    const maxTotalSpend = Math.max(...totalSpends);

    // Calculate core slice statistics and balance
    const coreSliceStats = calculateCoreSliceStats(
      CORE_SLICES,
      chosenMapLocations,
      settings.sliceGenerationConfig?.entropicScarValue ?? 2,
    );

    const coreSliceSpends = coreSliceStats.map(
      (stats) => stats.resources + stats.influence + stats.flex,
    );

    const minCoreSpend = Math.min(...coreSliceSpends);
    const maxCoreSpend = Math.max(...coreSliceSpends);

    // Calculate maximum difference between core slices (measure of balance)
    const coreSliceBalance = maxCoreSpend - minCoreSpend;

    // Count total red tiles
    const mapRedCount = Object.values(chosenMapLocations).filter(
      (id) => systemData[id].type === "RED",
    ).length;
    const sliceRedCount = slices
      .flat()
      .filter((id) => systemData[id].type === "RED").length;
    const redTileCount = mapRedCount + sliceRedCount;

    const mapStats = calculateMapStats(slices, map);

    // Check balance criteria
    if (
      minTotalSpend < 4 ||
      maxTotalSpend > 9 ||
      minPlanets < 2 ||
      maxPlanets > 5 ||
      redTileCount < MIN_RED_TILES || // Ensure minimum anomaly count
      (config.type === "heisen" && mapStats.totalLegendary > 3) ||
      minCoreSpend < CORE_SLICE_MIN_OPTIMAL || // Minimum viable core slice optimal spend
      maxCoreSpend > CORE_SLICE_MAX_OPTIMAL || // Maximum core slice optimal spend
      coreSliceBalance > 3 || // Core slices should be within 3 points of each other
      hasAdjacentAnomalies(chosenMapLocations) // Check for adjacent anomalies
    ) {
      return generateMap(settings, systemPool, minorFactionPool, attempts + 1);
    }
  }

  return {
    map,
    slices,
    valid: attempts <= 1000,
  };
}

/**
 * Calculate the optimal stats for each core slice
 */
function calculateCoreSliceStats(
  coreSlices: number[][],
  chosenMapLocations: Record<number, SystemId>,
  entropicScarValue: number = 2,
) {
  return coreSlices.map((positions) => {
    const systems = positions
      .filter((pos) => chosenMapLocations[pos])
      .map((pos) => chosenMapLocations[pos])
      .map((id) => systemData[id]);

    return optimalStatsForSystems(systems, entropicScarValue);
  });
}

/**
 * Fill the core slices with systems of appropriate tiers,
 * avoiding adjacent anomalies and balancing optimal values
 */
function fillCoreSlices(
  coreSlices: number[][],
  coreSliceTiers: TieredSlice[],
  tieredSystems: Record<ChoosableTier, SystemId[]>,
  chosenMapLocations: Record<number, SystemId>,
  occupiedCorePositions: Record<number, SystemId>,
  entropicScarValue: number = 2,
) {
  // For each core slice
  for (let i = 0; i < coreSlices.length; i++) {
    const slicePositions = coreSlices[i];
    const sliceTiers = coreSliceTiers[i];

    // For each position in the slice
    for (let j = 0; j < slicePositions.length; j++) {
      const position = slicePositions[j];

      // Skip positions already filled by wormholes/legendaries
      if (occupiedCorePositions[position]) continue;

      // Get the desired tier for this position
      const desiredTier = sliceTiers[j] as ChoosableTier;

      // Get adjacent positions (to check for anomalies)
      const adjacentPositions = getAdjacentPositions(position);
      const adjacentSystemIds = adjacentPositions
        .filter((pos) => chosenMapLocations[pos])
        .map((pos) => chosenMapLocations[pos]);

      // Check if adjacent systems have anomalies
      const adjacentAnomalies = adjacentSystemIds.some(
        (id) => systemData[id] && systemData[id].anomalies.length > 0,
      );

      // If there are adjacent anomalies, prefer non-anomaly systems
      let candidateSystems = tieredSystems[desiredTier].filter((id) =>
        adjacentAnomalies ? systemData[id].anomalies.length === 0 : true,
      );

      // If no suitable systems in the desired tier, try other tiers
      if (candidateSystems.length === 0) {
        const alternativeTiers: ChoosableTier[] = ["high", "med", "low", "red"];
        for (const tier of alternativeTiers) {
          if (tier !== desiredTier) {
            candidateSystems = tieredSystems[tier].filter((id) =>
              adjacentAnomalies ? systemData[id].anomalies.length === 0 : true,
            );
            if (candidateSystems.length > 0) break;
          }
        }
      }

      // If still no suitable systems, use any system from the desired tier
      if (candidateSystems.length === 0)
        candidateSystems = tieredSystems[desiredTier];

      // Pre-evaluate how each candidate would affect the slice's optimal value
      if (candidateSystems.length > 1) {
        // Get current systems in this slice
        const currentSliceSystems = slicePositions
          .filter((pos) => pos !== position && chosenMapLocations[pos])
          .map((pos) => systemData[chosenMapLocations[pos]]);

        // Sort candidates by how well they balance the slice
        candidateSystems.sort((a, b) => {
          const optA = optimalStatsForSystems(
            [...currentSliceSystems, systemData[a]],
            entropicScarValue,
          );
          const optB = optimalStatsForSystems(
            [...currentSliceSystems, systemData[b]],
            entropicScarValue,
          );
          const totalA = optA.resources + optA.influence + optA.flex;
          const totalB = optB.resources + optB.influence + optB.flex;

          // Prioritize systems that keep the slice within optimal range
          const aInRange =
            totalA >= CORE_SLICE_MIN_OPTIMAL &&
            totalA <= CORE_SLICE_MAX_OPTIMAL;

          const bInRange =
            totalB >= CORE_SLICE_MIN_OPTIMAL &&
            totalB <= CORE_SLICE_MAX_OPTIMAL;

          if (aInRange && !bInRange) return -1;
          if (!aInRange && bInRange) return 1;

          // If both in range or both out of range, prefer the one closer to the middle of the range
          const targetOptimal =
            (CORE_SLICE_MIN_OPTIMAL + CORE_SLICE_MAX_OPTIMAL) / 2;

          return (
            Math.abs(totalA - targetOptimal) - Math.abs(totalB - targetOptimal)
          );
        });
      }

      // If we have candidates, select one and assign it
      if (candidateSystems.length > 0) {
        const selectedSystem = candidateSystems[0];
        chosenMapLocations[position] = selectedSystem;

        // Remove the selected system from tieredSystems
        const tierIndex = tieredSystems[desiredTier].indexOf(selectedSystem);
        if (tierIndex !== -1) tieredSystems[desiredTier].splice(tierIndex, 1);
      }
    }
  }
}

type Swap = { toRemove: SystemId; toAdd: SystemId };
const rebalanceTraits = (
  usedSystems: SystemId[],
  availableSystems: SystemId[],
  swaps: Swap[] = [],
  attempts: number = 0,
  maxAttempts: number = 10,
  mapLocations: Record<number, SystemId> = {},
): { swaps: Swap[] } => {
  // Create copies of arrays to avoid modifying the originals
  const usedSystemsCopy = [...usedSystems];
  const availableSystemsCopy = [...availableSystems];

  // Count planet traits in the current used systems
  const planetTraits = countPlanetTraits(usedSystemsCopy);
  const { spread, maxTrait, minTrait } = calculateSpread(planetTraits);

  // Exit conditions: spread is acceptable or too many attempts
  if (attempts >= maxAttempts)
    console.log("Failed to rebalance after maximum attempts");
  if (spread < 3 || attempts >= maxAttempts) return { swaps };

  const systemsOnMap = Object.values(mapLocations);

  // Find best swap that reduces the trait imbalance
  let bestSwap: {
    toRemove: SystemId;
    toAdd: SystemId;
    newSpread: number;
  } | null = null;

  // First, identify systems that have the most common trait and could be swapped out
  const candidatesToRemove = usedSystemsCopy
    .filter((id) => {
      // Must have at least one planet with the most common trait
      const hasMaxTrait = systemData[id].planets.some(({ trait }) =>
        trait?.includes(maxTrait),
      );
      // If it's on the map and has wormholes, don't swap it to avoid breaking wormhole placement
      const isSafeToRemove = !(
        systemsOnMap.includes(id) && systemData[id].wormholes.length > 0
      );
      return hasMaxTrait && isSafeToRemove;
    })
    .sort(
      // Sort by how many planets have the max trait, most first
      (a, b) =>
        systemData[b].planets.filter(({ trait }) => trait?.includes(maxTrait))
          .length -
        systemData[a].planets.filter(({ trait }) => trait?.includes(maxTrait))
          .length,
    );

  // Try each candidate for removal
  for (const toRemove of candidatesToRemove) {
    // Find possible additions that have the least common trait
    const possibleAdditions = availableSystemsCopy.filter((id) => {
      // Must have at least one planet with the least common trait
      const hasMinTrait = systemData[id].planets.some(({ trait }) =>
        trait?.includes(minTrait),
      );

      // Planet count constraint is relaxed - allow +/-1 difference to increase swap opportunities
      const planetCountMatches =
        Math.abs(
          systemData[id].planets.length - systemData[toRemove].planets.length,
        ) <= 1;

      // If the system to remove is on the map and has wormholes, ensure replacement also has wormholes
      const wormholesMatch =
        systemsOnMap.includes(toRemove) &&
        systemData[toRemove].wormholes.length > 0
          ? systemData[id].wormholes.length > 0
          : true;

      return hasMinTrait && planetCountMatches && wormholesMatch;
    });

    // Evaluate each possible swap to find the one that gives the best balance
    for (const toAdd of possibleAdditions) {
      // Create a temporary state with this swap applied
      const tempUsed = usedSystemsCopy
        .filter((id) => id !== toRemove)
        .concat(toAdd);

      // Calculate the new trait distribution
      const newTraits = countPlanetTraits(tempUsed);
      const { spread: newSpread } = calculateSpread(newTraits);

      // Update best swap if this one is better
      if (bestSwap === null || newSpread < bestSwap.newSpread) {
        bestSwap = { toRemove, toAdd, newSpread };
      }
    }
  }

  // If no swap was found that improves balance, return current swaps
  if (!bestSwap || bestSwap.newSpread >= spread) {
    return { swaps };
  }

  // Apply the best swap
  const { toRemove, toAdd } = bestSwap;

  // Update the passed-in arrays for the next iteration
  const newUsedSystems = usedSystemsCopy
    .filter((id) => id !== toRemove)
    .concat(toAdd);
  const newAvailableSystems = availableSystemsCopy
    .filter((id) => id !== toAdd)
    .concat(toRemove);

  // Add this swap to our list of swaps
  swaps.push({ toRemove, toAdd });

  // Continue rebalancing recursively
  return rebalanceTraits(
    newUsedSystems,
    newAvailableSystems,
    swaps,
    attempts + 1,
    maxAttempts,
    mapLocations,
  );
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
const countPlanetTraits = (used: SystemId[]) => {
  const planetTraits: Record<PlanetTrait, number> = {
    HAZARDOUS: 0,
    CULTURAL: 0,
    INDUSTRIAL: 0,
  };

  used.forEach((id) => {
    systemData[id].planets.forEach(({ trait: traits }) => {
      if (traits) {
        for (const trait of traits) {
          planetTraits[trait] += 1;
        }
      }
    });
  });

  return planetTraits;
};

export function generateSlices(
  sliceCount: number,
  availableSystems: SystemId[],
  config: SliceGenerationConfig = {
    numAlphas: 0,
    numBetas: 0,
    minLegendaries: 0,
  },
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
      minAlphaWormholes: config.numAlphas,
      minBetaWormholes: config.numBetas,
      minLegendary: config.minLegendaries ?? 0,
    },
  );
  const tieredChosenTiles = getTieredSystems(chosenTiles);
  const tieredRemainingTiles = getTieredSystems(remainingTiles);

  // distirbute the wormholes/legendaries in round robin fashion
  // on the slices.
  const slices: SystemIds[] = Array.from({ length: sliceCount }, () => []);
  fillSlicesWithRequiredTiles(tieredSlices, tieredChosenTiles, slices);

  // fill slices with remaining tiles, respecting the 'tier' requirements
  // of the spots in each slice.
  fillSlicesWithRemainingTiles(
    tieredSlices,
    tieredRemainingTiles,
    slices,
    config?.entropicScarValue ?? 2,
  );

  // shuffle the slices
  return slices.map((slice) => shuffle(slice));
}

type Location = { mapIdx: number; position: { x: number; y: number } };

function distributeByDistance(
  availableLocations: Location[],
  availableSystems: SystemId[],
  numSpots: number,
  minDistance: number = 3,
) {
  const chosen: { location: Location; systemId: SystemId }[] = [];

  for (let i = 0; i < numSpots; i++) {
    // First tile gets placed randomly on any spot.
    if (i === 0) {
      const location = availableLocations.pop()!;
      chosen.push({ location, systemId: availableSystems.pop()! });
      continue;
    }

    // Loop through all other available locations
    // compute the distance to all the already chosen locations,
    // where the distance is the distance to the closest chosen location.
    const sortedLocations = availableLocations
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
      sortedLocations.pop()!.location;

    // remove the location from the list of available locations
    availableLocations.splice(availableLocations.indexOf(chosenLocation), 1);

    // Add chosen tile to the list of chosen tiles.
    chosen.push({
      location: chosenLocation,
      systemId: availableSystems.pop()!,
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
