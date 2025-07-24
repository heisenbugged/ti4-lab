import { coreGenerateMap } from "../common/sliceGenerator";
import { generateSlices } from "../milty/sliceGenerator";
import { DraftConfig } from "../types";

export const milty7p: DraftConfig = {
  numPlayers: 7,
  type: "milty7p",
  mapSize: 4,
  numSystemsInSlice: 5,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [37, 22, 25, 49, 52, 55, 58],
  modifiableMapTiles: [],
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
    { x: -1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: [
      [1, 0],
      [0, 1],
      [-1, 1],
      [1, 2],
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
      [0, -1],
      [2, -1],
      [1, 0],
      [2, -2],
      [3, -2],
    ],
    6: [
      [1, -1],
      [1, 0],
      [0, 1],
      [2, -1],
      [2, 0],
    ],
  } as Record<number, [number, number][]>,
  generateMap: (settings, systemPool, minorFactionPool) =>
    coreGenerateMap(settings, systemPool, 0, generateSlices, minorFactionPool),
  generateSlices,
};
