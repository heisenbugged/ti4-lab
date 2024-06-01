type Option<T> = {
  weight: number;
  value: T;
};

/**
 * Given an array of options, each with a weight, randomly choose one of the options
 * based on the weights. Internally uses a cumulative distribution function.
 */

export function weightedChoice<T>(options: Option<T>[]) {
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
  const copiedArray = array.slice();

  // Fisher-Yates Shuffle
  for (let i = copiedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]]; // Swap elements
  }

  return copiedArray;
}
