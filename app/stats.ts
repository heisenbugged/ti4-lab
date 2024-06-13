import { System } from "./types";

// TODO: Move these methods elsewhere

export const valueSlice = (sliceSystems: System[]) =>
  sliceSystems.reduce(
    (acc, s) =>
      acc +
      s.optimalSpend.flex +
      s.optimalSpend.influence +
      s.optimalSpend.resources,
    0,
  );

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
