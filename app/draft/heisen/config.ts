import { DraftConfig } from "../types";
import { generateMap, generateSlices } from "./generateMap";
import { STANDARD_6P_HOME_POSITIONS } from "~/utils/mapGenerator";

export const heisen: DraftConfig = {
  numPlayers: 6,
  type: "heisen",
  numSystemsInSlice: 3,
  sliceHeight: 2,
  sliceConcentricCircles: 1,
  homeIdxInMapString: STANDARD_6P_HOME_POSITIONS,
  modifiableMapTiles: [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18],
  presetTiles: {},
  closedMapTiles: [],
  mecatolPathSystemIndices: [1],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ],
  seatTilePlacement: {
    0: [
      [1, 0],
      [0, 1],
      [-1, 1],
    ],
    1: [
      [0, 1],
      [-1, 1],
      [-1, 0],
    ],
    2: [
      [-1, 1],
      [-1, 0],
      [0, -1],
    ],
    3: [
      [-1, 0],
      [0, -1],
      [1, -1],
    ],
    4: [
      [0, -1],
      [1, -1],
      [1, 0],
    ],
    5: [
      [1, -1],
      [1, 0],
      [0, 1],
    ],
  } as Record<number, [number, number][]>,
  generateMap,
  generateSlices,
};
