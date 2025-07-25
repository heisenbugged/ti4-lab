import { coreGenerateMap } from "../common/sliceGenerator";
import { generateSlices } from "../milty/sliceGenerator";
import { DraftConfig } from "../types";

export const milty8p: DraftConfig = {
  numPlayers: 8,
  type: "milty8p",
  mapSize: 4,
  numSystemsInSlice: 5,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [37, 40, 43, 46, 49, 52, 55, 58],
  modifiableMapTiles: [],
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
      [0, 1],
      [-2, 1],
      [-1, 0],
      [-2, 2],
      [-3, 2],
    ],
    3: [
      [-1, 1],
      [-1, 0],
      [0, -1],
      [-2, 1],
      [-2, 0],
    ],
    4: [
      [-1, 0],
      [0, -1],
      [1, -1],
      [-1, -1],
      [0, -2],
    ],
    5: [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, -2],
      [2, -2],
    ],
    6: [
      [0, -1],
      [2, -1],
      [1, 0],
      [2, -2],
      [3, -2],
    ],
    7: [
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
