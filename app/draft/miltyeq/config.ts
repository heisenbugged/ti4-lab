import { DraftConfig } from "../types";
import { generateMap, generateSlices } from "./sliceGenerator";
import { STANDARD_6P_HOME_POSITIONS } from "~/utils/mapGenerator";

export const miltyeq: DraftConfig = {
  numPlayers: 6,
  minorFactionsEqPositions: [8, 10, 12, 14, 16, 18],
  type: "miltyeq",
  numSystemsInSlice: 4,
  mecatolPathSystemIndices: [1, 3],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: STANDARD_6P_HOME_POSITIONS,
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
