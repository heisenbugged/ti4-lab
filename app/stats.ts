import { systemData } from "./data/systemData";
import { System } from "./types";

type GeneratedSlice = {
  systems: System[];
  value: number;
};

export function randomizeSlices(
  systems: System[],
  varianceLevel: "low" | "medium" | "high" | "extreme",
  opulence: "poverty" | "low" | "medium" | "high" | "wealthy",
) {
  const sliceSize = 3;
  const numSlices = 6;
  const maxAttempts = 10000;

  // Generate random slices and filter them
  let slices = [];
  for (let i = 0; i < maxAttempts; i++) {
    let slice = generateSlice(systems, sliceSize);
    slices.push(slice);
  }

  const meanValue = slices.reduce((a, b) => a + b.value, 0) / slices.length;
  const stdDev = Math.sqrt(
    slices.reduce((a, b) => a + Math.pow(b.value - meanValue, 2), 0) /
      slices.length,
  );

  // Sample the slices based on variance level
  // usedIndices is a dictionary of system ids that have been used
  // to make sure we skip over systems that have already been used
  let usedIndices = {};
  const selectedSlices = [];
  for (let i = 0; i < numSlices; i++) {
    selectedSlices.push(
      sampleSlice(
        slices,
        varianceLevel,
        opulence,
        meanValue,
        stdDev,
        usedIndices,
      ),
    );
  }

  console.log(
    "the slices values are",
    selectedSlices.map((s) => s.value),
  );

  return selectedSlices;
}

function generateSlice(systems: System[], sliceSize: number) {
  let indices: number[] = [];
  while (indices.length < sliceSize) {
    let index = Math.floor(Math.random() * systems.length);
    if (!indices.includes(index)) {
      indices.push(index);
    }
  }
  const sliceSystems = indices.map((index) => systems[index]);
  return {
    systems: sliceSystems,
    value: sliceSystems.reduce(
      (acc, s, idx) => acc + valueSystem(s, idx === 1),
      0,
    ),
  };
}

const varianceMultipliers: Record<
  "low" | "medium" | "high" | "extreme",
  number
> = {
  low: 0.5,
  medium: 1,
  high: 2,
  extreme: 3,
};

function sampleSlice(
  slices: GeneratedSlice[],
  varianceLevel: "low" | "medium" | "high" | "extreme",
  opulence: "poverty" | "low" | "medium" | "high" | "wealthy" = "medium",
  meanValue: number,
  stdDev: number,
  usedSystems: Record<number, boolean>,
  maxAttempts: number = 10000,
): GeneratedSlice {
  // Adjust the mean value based on the skew
  let adjustedMeanValue = meanValue;
  if (opulence === "wealthy") {
    adjustedMeanValue += stdDev * 1.5; // Shift mean higher
  } else if (opulence === "high") {
    adjustedMeanValue += stdDev; // Shift mean higher
  } else if (opulence === "low") {
    adjustedMeanValue -= stdDev; // Shift mean lower
  } else if (opulence === "poverty") {
    adjustedMeanValue -= stdDev * 1.5; // Shift mean lower
  }

  let sliceCandidate;
  let attempt = 0;
  let invalidCandidate = false;
  do {
    const index = Math.floor(Math.random() * slices.length);
    sliceCandidate = slices[index];
    attempt += 1;
    invalidCandidate = sliceCandidate.systems.some((s) => usedSystems[s.id]);

    // check if the slice is within the 'standard deviation' threshold.
    // higher variance = higher standard deviation threshold (wider range of allowed values)
    const varianceMultiplier = varianceMultipliers[varianceLevel];
    if (
      Math.abs(sliceCandidate.value - adjustedMeanValue) >=
      stdDev * varianceMultiplier
    ) {
      invalidCandidate = true;
    }
  } while (invalidCandidate && attempt < maxAttempts);

  sliceCandidate.systems.forEach((s) => (usedSystems[s.id] = true));
  return sliceCandidate;
}

export const valueSlice = (sliceSystems: System[]) =>
  sliceSystems.reduce(
    // TODO: isOnMecatolPath = idx === 1 ASSUMES heisen draft.
    (acc, s, idx) => acc + valueSystem(s, idx === 1),
    0,
  );

export const valueSystem = (
  system: System,
  isOnMecatolPath: boolean = false,
) => {
  let score = 0;
  system.planets.forEach((planet) => {
    if (planet.resources > planet.influence) {
      score += planet.resources;
    } else {
      score += planet.influence;
    }

    if (planet.name === "Primor") score += 1;
    if (planet.name === "Hope's End") score += 2;
    if (planet.techSpecialty) score += 1;
  });

  if (isOnMecatolPath && system.anomaly === "SUPERNOVA") {
    score -= 2;
  }
  if (isOnMecatolPath && system.anomaly && system.anomaly !== "SUPERNOVA")
    score -= 1;
  if (system.wormhole) score += 1;

  return score;
};

export function fisherYatesShuffle<T>(array: T[], x: number) {
  // Copy the original array to avoid modifying it
  let copiedArray = array.slice();

  // Fisher-Yates Shuffle
  for (let i = copiedArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]]; // Swap elements
  }

  // Return the first x elements of the shuffled array
  return copiedArray.slice(0, x);
}
