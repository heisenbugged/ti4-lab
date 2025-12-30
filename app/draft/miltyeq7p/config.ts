import { generateSlices, generateMap } from "../miltyeq/sliceGenerator";
import { DraftConfig } from "../types";

export const miltyeq7p: DraftConfig = {
  numPlayers: 7,
  type: "miltyeq7p",
  mapSize: 4,
  numSystemsInSlice: 4,
  mecatolPathSystemIndices: [1, 3],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  minorFactionsEqPositions: [8, 10, 12, 15, 17, 29, 36],
  homeIdxInMapString: [37, 22, 25, 49, 52, 55, 58],
  modifiableMapTiles: [8, 10, 12, 15, 17, 29, 36],
  presetTiles: {
    4: { systemId: "84B" },
    5: { systemId: "89B" },
    27: { systemId: "86B" },
    1: { systemId: "83B" },
    20: { systemId: "85B" },
    33: { systemId: "88B", rotation: 120 }, // with a turn
  },
  closedMapTiles: [39, 40, 41, 42, 43, 44, 45, 46, 47, 53, 54, 57],
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
      //   [1, 2],
      [0, 2],
    ],
    1: [
      [0, 1],
      [-1, 1],
      [-1, 0],
      //   [-1, 2],
      [-2, 2],
    ],
    2: [
      [-1, 1],
      [-1, 0],
      [0, -1],
      //   [-2, 1],
      [-2, 0],
    ],
    3: [
      [-1, 0],
      [0, -1],
      [1, -1],
      //   [-1, -1],
      [0, -2],
    ],
    4: [
      [0, -1],
      [1, -1],
      [1, 0],
      //   [1, -2],
      [2, -2],
    ],
    5: [
      [0, -1],
      [2, -1],
      [1, 0],
      //   [2, -2],
      [3, -2],
    ],
    6: [
      [1, -1],
      [1, 0],
      [0, 1],
      //   [2, -1],
      [2, 0],
    ],
  } as Record<number, [number, number][]>,
  generateMap,
  generateSlices,
};
