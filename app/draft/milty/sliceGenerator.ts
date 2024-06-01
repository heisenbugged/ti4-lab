import { weightedChoice } from "../helpers/randomization";
import {
  fillSlicesWithRemainingTiles,
  fillSlicesWithRequiredTiles,
  chooseRequiredSystems,
  separateAnomalies,
} from "../helpers/sliceGeneration";
import { SLICE_SHAPES } from "../sliceShapes";
import { TieredSlice } from "../types";

const HIGH = "high";
const MED = "med";
const LOW = "low";
const RED = "red";

const SLICE_TIERS = [RED, RED, HIGH, MED, LOW] as const;

const MIN_WORMHOLE_CHOICES = [
  { weight: 1, value: 2 },
  { weight: 1, value: 3 },
];

const MIN_LEGENDARY_CHOICES = [
  { weight: 1, value: 1 },
  { weight: 1, value: 2 },
];

export function generateSlices(sliceCount: number, availableSystems: number[]) {
  // miltydraft only has one slice choice
  const tieredSlices: TieredSlice[] = Array.from({ length: sliceCount }, () => [
    ...SLICE_TIERS,
  ]);

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
    slice = separateAnomalies(slice, SLICE_SHAPES.milty);
    slices[sliceIndex] = slice;
  }

  console.log(`miltyEq.generateSlices: ${JSON.stringify(slices)}`);

  return slices;
}
