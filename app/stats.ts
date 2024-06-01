import { DraftType } from "./draft";
import { System } from "./types";

type GeneratedSlice = {
  systems: System[];
  value: number;
};

export function generateSlices(
  numSlices: number,
  systems: System[],
  varianceLevel: "low" | "medium" | "high" | "extreme",
  opulence: "poverty" | "low" | "medium" | "high" | "wealthy",
  sliceSize: number,
  mapType: DraftType,
): GeneratedSlice[] {
  const maxAttempts = 100000;

  // Generate random slices and filter them
  const slices = [];
  for (let i = 0; i < maxAttempts; i++) {
    const slice = generateSlice(systems, sliceSize);
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
  const usedIndices = {};
  const selectedSlices = [];
  for (let i = 0; i < numSlices; i++) {
    const sample = sampleSlice(
      slices,
      varianceLevel,
      opulence,
      meanValue,
      stdDev,
      usedIndices,
      mapType,
    );
    if (sample) selectedSlices.push(sample);
    // TODO: currently if sample failed it just doesn't return a slice
    // which is not great, but is just a stopgap until we
    // replace this with a more robust solution
  }

  return selectedSlices;
}

function generateSlice(systems: System[], sliceSize: number) {
  const indices: number[] = [];
  while (indices.length < sliceSize) {
    const index = Math.floor(Math.random() * systems.length);
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
  mapType: DraftType,
  maxAttempts: number = 100000,
): GeneratedSlice | undefined {
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

  if (attempt >= maxAttempts) {
    console.log("Failed to find a valid slice after 10000 attempts.");
    return undefined;
  }

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
  const copiedArray = array.slice();

  // Fisher-Yates Shuffle
  for (let i = copiedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]]; // Swap elements
  }

  // Return the first x elements of the shuffled array
  return copiedArray.slice(0, x);
}
