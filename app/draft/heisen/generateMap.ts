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
import { PlanetTrait, SystemIds, SystemId, DraftSettings } from "~/types";
import { generateEmptyMap, optimalStatsForSystems } from "~/utils/map";
import { draftConfig } from "../draftConfig";
import { calculateMapStats } from "~/hooks/useFullMapStats";

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

// NOTE: These indices do NOT include Mecatol Rex as 'index 0'
// Define core slices - the slices adjacent to Mecatol Rex
// These are the specific core slices consisting of positions around Mecatol Rex
const CORE_SLICES = [
  [0, 17, 7], // 12 o'clock core
  [1, 9, 7], // 2 o'clock core
  [2, 11, 9], // 4 o'clock core
  [3, 13, 11], // 6 o'clock core
  [4, 15, 13], // 8 o'clock core
  [5, 15, 17], // 10 o'clock core
];

// Define the optimal value range for core slices
const CORE_SLICE_MIN_OPTIMAL = 4; // Minimum optimal value for a core slice
const CORE_SLICE_MAX_OPTIMAL = 8; // Maximum optimal value for a core slice
const MIN_RED_TILES = 11; // Minimum red tiles on the map

export function generateMap(
  settings: DraftSettings,
  systemPool: SystemId[],
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
  const slices = generateSlices(sliceCount, remainingSystems(), {
    numAlphas: remainingAlphas,
    numBetas: remainingBetas,
    numLegendaries: remainingLegendaries,
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

  const map = generateEmptyMap(config);
  Object.entries(chosenMapLocations).forEach(([mapIdx, systemId]) => {
    const existing = map[Number(mapIdx) + 1];
    map[Number(mapIdx) + 1] = {
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
      const stats = optimalStatsForSystems(s.map((id) => systemData[id]));
      return stats.resources + stats.influence + stats.flex;
    });
    const minTotalSpend = Math.min(...totalSpends);
    const maxTotalSpend = Math.max(...totalSpends);

    // Calculate core slice statistics and balance
    const coreSliceStats = calculateCoreSliceStats(
      CORE_SLICES,
      chosenMapLocations,
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
      return generateMap(settings, systemPool, attempts + 1);
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
) {
  return coreSlices.map((positions) => {
    const systems = positions
      .filter((pos) => chosenMapLocations[pos])
      .map((pos) => chosenMapLocations[pos])
      .map((id) => systemData[id]);

    return optimalStatsForSystems(systems);
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
      if (candidateSystems.length === 0) {
        candidateSystems = tieredSystems[desiredTier];
      }

      // Pre-evaluate how each candidate would affect the slice's optimal value
      if (candidateSystems.length > 1) {
        // Get current systems in this slice
        const currentSliceSystems = slicePositions
          .filter((pos) => pos !== position && chosenMapLocations[pos])
          .map((pos) => systemData[chosenMapLocations[pos]]);

        // Sort candidates by how well they balance the slice
        candidateSystems.sort((a, b) => {
          const optA = optimalStatsForSystems([
            ...currentSliceSystems,
            systemData[a],
          ]);
          const optB = optimalStatsForSystems([
            ...currentSliceSystems,
            systemData[b],
          ]);
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
        if (tierIndex !== -1) {
          tieredSystems[desiredTier].splice(tierIndex, 1);
        }
      }
    }
  }

  // After placing all tiles, check if any core slice is significantly unbalanced
  // and try to fix it by swapping systems
  balanceCoreSlices(coreSlices, chosenMapLocations, tieredSystems);
}

/**
 * Balance core slices by swapping systems if necessary to improve optimal value distribution
 */
function balanceCoreSlices(
  coreSlices: number[][],
  chosenMapLocations: Record<number, SystemId>,
  tieredSystems: Record<ChoosableTier, SystemId[]>,
) {
  const sliceStats = calculateCoreSliceStats(coreSlices, chosenMapLocations);
  const sliceOptimalValues = sliceStats.map(
    (stats) => stats.resources + stats.influence + stats.flex,
  );

  const minOptimal = Math.min(...sliceOptimalValues);
  const maxOptimal = Math.max(...sliceOptimalValues);

  // If the slices are already balanced enough, don't make changes
  if (maxOptimal - minOptimal <= 3) {
    return;
  }

  // Find the richest and poorest slices
  const richestSliceIndex = sliceOptimalValues.indexOf(maxOptimal);
  const poorestSliceIndex = sliceOptimalValues.indexOf(minOptimal);

  // Try to find a pair of systems to swap that would improve balance
  const richestSlice = coreSlices[richestSliceIndex];
  const poorestSlice = coreSlices[poorestSliceIndex];

  // Get systems in each slice
  const richestSliceSystems = richestSlice
    .filter((pos) => chosenMapLocations[pos])
    .map((pos) => ({ pos, id: chosenMapLocations[pos] }));

  const poorestSliceSystems = poorestSlice
    .filter((pos) => chosenMapLocations[pos])
    .map((pos) => ({ pos, id: chosenMapLocations[pos] }));

  // Try each possible swap and see if it improves balance
  for (const richSystem of richestSliceSystems) {
    for (const poorSystem of poorestSliceSystems) {
      // Skip if either system is a wormhole, legendary, or has adjacency issues
      const richHasAdjAnomalies = hasAdjacentAnomaliesAtPosition(
        richSystem.pos,
        chosenMapLocations,
        poorSystem.id,
      );
      const poorHasAdjAnomalies = hasAdjacentAnomaliesAtPosition(
        poorSystem.pos,
        chosenMapLocations,
        richSystem.id,
      );

      if (richHasAdjAnomalies || poorHasAdjAnomalies) {
        continue;
      }

      // Create a copy of the map with the swap applied
      const newMap = { ...chosenMapLocations };
      newMap[richSystem.pos] = poorSystem.id;
      newMap[poorSystem.pos] = richSystem.id;

      // Calculate new optimal values
      const newSliceStats = calculateCoreSliceStats(coreSlices, newMap);
      const newOptimalValues = newSliceStats.map(
        (stats) => stats.resources + stats.influence + stats.flex,
      );

      const newMinOptimal = Math.min(...newOptimalValues);
      const newMaxOptimal = Math.max(...newOptimalValues);

      // If this swap improves balance, apply it
      if (newMaxOptimal - newMinOptimal < maxOptimal - minOptimal) {
        chosenMapLocations[richSystem.pos] = poorSystem.id;
        chosenMapLocations[poorSystem.pos] = richSystem.id;
        return; // Stop after first improvement
      }
    }
  }
}

/**
 * Check if placing a system at a position would create adjacent anomalies
 */
function hasAdjacentAnomaliesAtPosition(
  position: number,
  chosenMapLocations: Record<number, SystemId>,
  testSystemId: SystemId,
): boolean {
  // Skip if the test system is not an anomaly
  if (systemData[testSystemId].anomalies.length === 0) {
    return false;
  }

  // Get adjacent positions
  const adjacentPositions = getAdjacentPositions(position);

  // Check if any adjacent system is also an anomaly
  for (const adjPos of adjacentPositions) {
    const adjSystemId = chosenMapLocations[adjPos];
    if (adjSystemId && systemData[adjSystemId].anomalies.length > 0) {
      return true; // Found adjacent anomalies
    }
  }

  return false;
}

/**
 * Get positions adjacent to the given position in the hexagonal grid
 */
function getAdjacentPositions(position: number): number[] {
  // Convert position index to actual coordinates in the hex grid
  const posCoords = mapStringOrder[position + 1];
  if (!posCoords) return [];

  const adjacentPositions: number[] = [];

  // In a hex grid, adjacent hexes are at these relative coordinates:
  const adjacentOffsets = [
    { x: 1, y: 0, z: -1 }, // right
    { x: 1, y: -1, z: 0 }, // upper right
    { x: 0, y: -1, z: 1 }, // upper left
    { x: -1, y: 0, z: 1 }, // left
    { x: -1, y: 1, z: 0 }, // bottom left
    { x: 0, y: 1, z: -1 }, // bottom right
  ];

  // Check each adjacent direction
  for (const offset of adjacentOffsets) {
    const adjX = posCoords.x + offset.x;
    const adjY = posCoords.y + offset.y;
    const adjZ = offset.z !== undefined ? posCoords.z + offset.z : -adjX - adjY; // Calculate z if not provided

    // Find the index of this adjacent position in mapStringOrder
    const adjIndex = mapStringOrder.findIndex(
      (coords) =>
        coords.x === adjX &&
        coords.y === adjY &&
        (coords.z === adjZ ||
          (coords.z === undefined && -adjX - adjY === adjZ)),
    );

    if (adjIndex !== -1) {
      adjacentPositions.push(adjIndex - 1);
    }
  }

  return adjacentPositions;
}

/**
 * Check if there are any adjacent anomalies in the map
 */
function hasAdjacentAnomalies(
  chosenMapLocations: Record<number, SystemId>,
): boolean {
  // For each position with a system
  for (const [posStr, systemId] of Object.entries(chosenMapLocations)) {
    const position = parseInt(posStr);

    // Skip if not an anomaly
    if (systemData[systemId].anomalies.length === 0) {
      continue;
    }

    // Get adjacent positions
    const adjacentPositions = getAdjacentPositions(position);

    // Check if any adjacent system is also an anomaly
    for (const adjPos of adjacentPositions) {
      const adjSystemId = chosenMapLocations[adjPos];
      if (adjSystemId && systemData[adjSystemId].anomalies.length > 0) {
        return true; // Found adjacent anomalies
      }
    }
  }

  return false;
}

type Swap = { toRemove: SystemId; toAdd: SystemId };
const rebalanceTraits = (
  usedSystems: SystemId[],
  availableSystems: SystemId[],
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
const countPlanetTraits = (used: SystemId[]) => {
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
  availableSystems: SystemId[],
  config: SliceGenerationConfig = {
    numAlphas: 0,
    numBetas: 0,
    numLegendaries: 0,
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
      minLegendary: config.numLegendaries,
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
  fillSlicesWithRemainingTiles(tieredSlices, tieredRemainingTiles, slices);

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
