import { rotate, rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateSlices } from "../milty/altSliceGenerator";

const slice: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [1, 1],
  [0, 2],
];

export const milty4p: DraftConfig = {
  type: "milty",
  numSystemsInSlice: 5,
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [25, 31, 34, 22],
  modifiableMapTiles: [],
  presetTiles: {
    1: { systemId: "85A", rotation: 180 },
    4: { systemId: "85A", rotation: 0 },
    8: {
      systemId: "87A",
      rotation: 180,
    },
    12: {
      systemId: "87A",
      rotation: 120,
    },
    14: {
      systemId: "87A",
      rotation: 0,
    },
    18: {
      systemId: "87A",
      rotation: 300,
    },
    19: { systemId: "85A", rotation: 180 },
    20: {
      systemId: "84A",
      rotation: 0,
    },
    27: {
      systemId: "84A",
      rotation: 120,
    },
    28: {
      systemId: "85A",
      rotation: 0,
    },
    29: {
      systemId: "84A",
      rotation: 0,
    },
    36: {
      systemId: "84A",
      rotation: 120,
    },
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
      [-1, 1],
      [-1, -0],
      [0, -1],
      [-3, 2],
      [-2, -0],
    ],
    1: rotateSlice(slice, 4),
    2: [
      [1, -1],
      [1, 0],
      [0, 1],
      [3, -2],
      [2, 0],
    ],
    3: rotateSlice(slice, 1),
  } as Record<number, [number, number][]>,
  generateSlices,
};

console.log("rotated slice", JSON.stringify(rotateSlice(slice, 5)));

// "83A": {
//   id: "83A",
//   type: "HYPERLANE",
//   hyperlanes: [[1, 4]],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "83B": {
//   id: "83B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 2],
//     [3, 5],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "84A": {
//   id: "84A",
//   type: "HYPERLANE",
//   hyperlanes: [[2, 5]],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "84B": {
//   id: "84B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 4],
//     [1, 3],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "85A": {
//   id: "85A",
//   type: "HYPERLANE",
//   hyperlanes: [[1, 5]],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "85B": {
//   id: "85B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 2],
//     [3, 5],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "86A": {
//   id: "86A",
//   type: "HYPERLANE",
//   hyperlanes: [[1, 5]],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "86B": {
//   id: "86B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 4],
//     [1, 3],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "87A": {
//   id: "87A",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 2],
//     [2, 4],
//     [2, 5],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "87B": {
//   id: "87B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 2],
//     [0, 3],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "88A": {
//   id: "88A",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 4],
//     [1, 4],
//     [2, 4],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "88B": {
//   id: "88B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 2],
//     [3, 5],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "89A": {
//   id: "89A",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 2],
//     [0, 4],
//     [2, 4],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "89B": {
//   id: "89B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 4],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "90A": {
//   id: "90A",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [1, 5],
//     [2, 4],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "90B": {
//   id: "90B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 4],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "91A": {
//   id: "91A",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 3],
//     [0, 4],
//     [1, 3],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
// "91B": {
//   id: "91B",
//   type: "HYPERLANE",
//   hyperlanes: [
//     [0, 2],
//     [0, 3],
//   ],
//   wormholes: [],
//   planets: [],
//   anomalies: [],
// },
