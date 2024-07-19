import { DraftConfig } from "../types";
import { generateSlices } from "../milty/sliceGenerator";

export const milty5p: DraftConfig = {
  type: "milty5p",
  numSystemsInSlice: 5,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [19, 22, 25, 31, 34],
  modifiableMapTiles: [],
  presetTiles: {
    4: { systemId: "85A" },
    12: { systemId: "87A", rotation: 120 },
    14: { systemId: "87A" },
    27: { systemId: "83A" },
    28: { systemId: "85A" },
    29: { systemId: "83A", rotation: 240 },
  },

  closedMapTiles: [],
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
      [-3, 2],
      [-2, 0],
    ],
    3: [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, -2],
      [2, -2],
    ],
    4: [
      [1, -1],
      [1, 0],
      [0, 1],
      [2, -1],
      [2, 0],
    ],
  } as Record<number, [number, number][]>,
  generateSlices,
};
