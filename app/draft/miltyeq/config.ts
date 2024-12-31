import { DraftConfig } from "../types";
import { generateMap, generateSlices } from "./sliceGenerator";

export const miltyeq: DraftConfig = {
  numPlayers: 6,
  type: "miltyeq",
  numSystemsInSlice: 4,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [19, 22, 25, 28, 31, 34],
  modifiableMapTiles: [8, 10, 12, 14, 16, 18],
  presetTiles: {},
  closedMapTiles: [],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: [
      [1, 0],
      [0, 1],
      [-1, 1],
      [0, 2],
    ],
    1: [
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-2, 2],
    ],
    2: [
      [-1, 1],
      [-1, 0],
      [0, -1],
      [-2, 0],
    ],
    3: [
      [-1, 0],
      [0, -1],
      [1, -1],
      [0, -2],
    ],
    4: [
      [0, -1],
      [1, -1],
      [1, 0],
      [2, -2],
    ],
    5: [
      [1, -1],
      [1, 0],
      [0, 1],
      [2, 0],
    ],
  } as Record<number, [number, number][]>,
  generateMap,
  generateSlices,
};
