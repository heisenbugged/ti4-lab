import { rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateSlices } from "./sliceGenerator";

const slice: [number, number][] = [
  [-1, 1],
  [-2, 2],
  [0, 1],
  [1, 1],
  [1, 2],
];

export const wekker: DraftConfig = {
  type: "wekker",
  numSystemsInSlice: 5,
  sliceHeight: 3.5,
  sliceConcentricCircles: 1.5,
  wOffsetMultiplier: -0.75,
  homeIdxInMapString: [19, 22, 25, 28, 31, 34],
  modifiableMapTiles: [],
  presetTiles: {},
  closedMapTiles: [],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: 1, y: -1 },
    { x: 2, y: -2 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: -2 },
  ],
  seatTilePlacement: {
    0: slice,
    1: rotateSlice(slice, 1),
    2: rotateSlice(slice, 2),
    3: rotateSlice(slice, 3),
    4: rotateSlice(slice, 4),
    5: rotateSlice(slice, 5),
  } as Record<number, [number, number][]>,
  generateSlices,
};
