import { shuffle, weightedChoice } from "../helpers/randomization";
import {
  fillSlicesWithRemainingTiles,
  fillSlicesWithRequiredTiles,
  chooseRequiredSystems,
  separateAnomalies,
} from "../helpers/sliceGeneration";
import { SLICE_SHAPES } from "../sliceShapes";
import { ChoosableTier, TieredSlice } from "../types";

const HIGH = "high";
const MED = "med";
const LOW = "low";
const RED = "red";

type SliceChoice = {
  weight: number;
  value: ChoosableTier[];
};

const SLICE_CHOICES: SliceChoice[] = [
  // 2 red
  { weight: 2, value: [RED, RED, HIGH, HIGH] }, // 6
  { weight: 3, value: [RED, RED, HIGH, MED] }, // 5
  { weight: 1, value: [RED, RED, MED, MED] }, // 4

  // 1 red
  { weight: 2, value: [RED, HIGH, MED, LOW] }, // 6
  { weight: 3, value: [RED, HIGH, LOW, LOW] }, // 5
  { weight: 2, value: [RED, MED, MED, LOW] }, // 5
  { weight: 1, value: [RED, MED, LOW, LOW] }, // 4
];

const MIN_WORMHOLE_CHOICES = [
  { weight: 1, value: 2 },
  { weight: 1, value: 3 },
];

const MIN_LEGENDARY_CHOICES = [
  { weight: 1, value: 1 },
  { weight: 1, value: 2 },
];

export function generateSlices(sliceCount: number, availableSystems: number[]) {
  const tieredSlices: TieredSlice[] = [];
  for (let i = 0; i < sliceCount; i++) {
    const tierValues = shuffle(weightedChoice(SLICE_CHOICES));
    tieredSlices.push(tierValues);
  }

  // Enforce a minimum number of wormholes and legendary planets
  const minAlphaWormholes = weightedChoice(MIN_WORMHOLE_CHOICES);
  const minBetaWormholes = weightedChoice(MIN_WORMHOLE_CHOICES);
  const minLegendary = weightedChoice(MIN_LEGENDARY_CHOICES);
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

  // finally, we separate anomalies
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    let slice = slices[sliceIndex];
    slice = separateAnomalies(slice, SLICE_SHAPES.milty_eq);
    slices[sliceIndex] = slice;
  }

  console.log(`miltyEq.generateSlices: ${JSON.stringify(slices)}`);

  return slices;
}
