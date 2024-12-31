import { rotateSlice } from "~/utils/hexagonal";
import { generateSlices } from "../miltyeq/sliceGenerator";
import { DraftConfig } from "../types";

const slice: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [0, 2],
];

export const miltyeq7plarge: DraftConfig = {
  numPlayers: 7,
  type: "miltyeq7plarge",
  mapSize: 4,
  numSystemsInSlice: 4,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [46, 49, 52, 56, 59, 39, 42],
  modifiableMapTiles: [1, 7, 19, 2, 9, 3, 11, 24, 4, 5, 15, 32, 6, 17, 29, 27],
  presetTiles: {},
  closedMapTiles: [37, 38, 41, 44, 45, 53, 54, 57, 60],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: rotateSlice(slice, 2),
    1: rotateSlice(slice, 3),
    2: rotateSlice(slice, 4),
    3: rotateSlice(slice, 5),
    4: [
      [1, 0],
      [0, 1],
      [-1, 1],
      [1, 1],
    ],
    5: [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 2],
    ],
    6: rotateSlice(slice, 1),
  } as Record<number, [number, number][]>,
  generateSlices,
};
