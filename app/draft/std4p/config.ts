import { rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateSlices } from "../heisen/generateMap";

const slice: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
];

export const std4p: DraftConfig = {
  numPlayers: 4,
  type: "std4p",
  numSystemsInSlice: 3,
  sliceHeight: 2,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [27, 32, 36, 23],
  modifiableMapTiles: [1, 2, 3, 4, 5, 6, 8, 11, 14, 17],
  presetTiles: {},
  closedMapTiles: [19, 20, 21, 22, 25, 28, 29, 30, 31, 34],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ],
  seatTilePlacement: {
    0: rotateSlice(slice, 3),
    1: rotateSlice(slice, 4),
    2: rotateSlice(slice, 6),
    3: rotateSlice(slice, 1),
  } as Record<number, [number, number][]>,
  generateSlices,
};
