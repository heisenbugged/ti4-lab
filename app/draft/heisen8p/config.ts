import { generateMap, generateSlices } from "../heisen/generateMap";
import { DraftConfig } from "../types";

export const heisen8p: DraftConfig = {
  type: "heisen8p",
  mapSize: 4,
  numSystemsInSlice: 3,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [37, 40, 43, 46, 49, 52, 55, 58],
  modifiableMapTiles: [
    3, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 20, 27, 29, 36,
  ],
  presetTiles: {
    1: { systemId: "87A", rotation: 60 },
    2: { systemId: "89B", rotation: 180 },
    4: { systemId: "88A", rotation: 120 },
    5: { systemId: "90B" },
    24: { systemId: "83B", rotation: 120 },
    33: { systemId: "85B", rotation: 120 },
  },
  closedMapTiles: [41, 42, 45, 53, 54, 57],
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
    ],
    1: [
      [0, 1],
      [-1, 1],
      [-1, 0],
    ],
    2: [
      [0, 1],
      [-2, 1],
      [-1, 0],
    ],
    3: [
      [-1, 1],
      [-1, 0],
      [0, -1],
    ],
    4: [
      [-1, 0],
      [0, -1],
      [1, -1],
    ],
    5: [
      [0, -1],
      [1, -1],
      [1, 0],
    ],
    6: [
      [0, -1],
      [2, -1],
      [1, 0],
    ],
    7: [
      [1, -1],
      [1, 0],
      [0, 1],
    ],
  } as Record<number, [number, number][]>,
  generateMap,
  generateSlices,
};
