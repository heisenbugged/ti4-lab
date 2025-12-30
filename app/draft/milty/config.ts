import { rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateSlices } from "./sliceGenerator";
import { coreGenerateMap } from "../common/sliceGenerator";

const slice: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [1, 1],
  [0, 2],
];

export const milty: DraftConfig = {
  numPlayers: 6,
  type: "milty",
  numSystemsInSlice: 5,
  mecatolPathSystemIndices: [1, 4],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [19, 22, 25, 28, 31, 34],
  modifiableMapTiles: [],
  presetTiles: {},
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
    0: slice,
    1: rotateSlice(slice, 1),
    2: rotateSlice(slice, 2),
    3: rotateSlice(slice, 3),
    4: rotateSlice(slice, 4),
    5: rotateSlice(slice, 5),
    6: rotateSlice(slice, 6),
  } as Record<number, [number, number][]>,
  generateMap: (settings, systemPool, minorFactionPool) =>
    coreGenerateMap(settings, systemPool, 0, generateSlices, minorFactionPool),
  generateSlices,
};
