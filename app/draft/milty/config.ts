import { DraftConfig } from "../types";
import { generateSlices } from "./sliceGenerator";

export const milty: DraftConfig = {
  type: "milty",
  numSystemsInSlice: 5,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [19, 22, 25, 28, 31, 34],
  modifiableMapTiles: [],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: [
      [1, 0],
      [0, 1],
      [-1, 1],
      [1, 1],
      [0, 2],
    ],
    1: [
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, 2],
      [-2, 2],
    ],
    2: [
      [-1, 1],
      [-1, 0],
      [0, -1],
      [-2, 1],
      [-2, 0],
    ],
    3: [
      [-1, 0],
      [0, -1],
      [1, -1],
      [-1, -1],
      [0, -2],
    ],
    4: [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, -2],
      [2, -2],
    ],
    5: [
      [1, -1],
      [1, 0],
      [0, 1],
      [2, -1],
      [2, 0],
    ],
  } as Record<number, [number, number][]>,
  generateSlices,
};
