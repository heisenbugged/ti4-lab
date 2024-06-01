/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */

import { DraftConfig, DraftType } from "./types";

export const draftConfig: Record<DraftType, DraftConfig> = {
  miltyeq: {
    type: "miltyeq",
    numSystemsInSlice: 4,
    sliceHeight: 3,
    sliceConcentricCircles: 1,

    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [19, 22, 25, 28, 31, 34],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [8, 10, 12, 14, 16, 18],

    seatTilePlacement: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 0, y: -2 },
    ],

    // For a given seat number (in clockwise order, from 0 to 5),
    // contains the relative positions to modify around the home system
    // to insert the player's slice.
    seatTilePositions: {
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
  },

  wekker: {
    type: "wekker",
    numSystemsInSlice: 5,
    sliceHeight: 3.5,
    sliceConcentricCircles: 1.5,
    wOffsetMultiplier: -0.75,

    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [19, 22, 25, 28, 31, 34],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [],

    seatTilePlacement: [
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 2, y: -2 },
      { x: 0, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: -2 },
    ],

    // For a given seat number (in clockwise order, from 0 to 5),
    // contains the relative positions to modify around the home system
    // to insert the player's slice.
    seatTilePositions: {
      0: [
        [-1, 1],
        [-2, 2],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      1: [
        [-1, 0],
        [-2, 0],
        [-1, 1],
        [-1, 2],
        [-2, 3],
      ],
      2: [
        [0, -1],
        [0, -2],
        [-1, 0],
        [-2, 1],
        [-3, 1],
      ],
      3: [
        [1, -1],
        [2, -2],
        [0, -1],
        [-1, -1],
        [-1, -2],
      ],
      4: [
        [1, 0],
        [2, 0],
        [1, -1],
        [1, -2],
        [2, -3],
      ],
      5: [
        [0, 1],
        [0, 2],
        [1, 0],
        [2, -1],
        [3, -1],
      ],
    } as Record<number, [number, number][]>,
  },
  miltyeqless: {
    type: "miltyeqless",
    numSystemsInSlice: 4,
    sliceHeight: 3,
    sliceConcentricCircles: 1,

    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [19, 22, 25, 28, 31, 34],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [],

    seatTilePlacement: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      // additional two slices for full milty draft
      // { x: -1, y: -1 },
      { x: 0, y: -2 },
    ],

    // For a given seat number (in clockwise order, from 0 to 5),
    // contains the relative positions to modify around the home system
    // to insert the player's slice.
    seatTilePositions: {
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
  },
  milty: {
    type: "milty",
    numSystemsInSlice: 5,
    sliceHeight: 3,
    sliceConcentricCircles: 1,

    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [19, 22, 25, 28, 31, 34],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [],

    seatTilePlacement: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
      { x: 0, y: -2 },
    ],

    // For a given seat number (in clockwise order, from 0 to 5),
    // contains the relative positions to modify around the home system
    // to insert the player's slice.
    seatTilePositions: {
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
        [1, -1],
        [1, 0],
        [0, 1],
        [2, -1],
        [2, 0],
      ],
    } as Record<number, [number, number][]>,
  },
  heisen: {
    type: "heisen",
    numSystemsInSlice: 3,
    sliceHeight: 2,
    sliceConcentricCircles: 1,
    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [19, 22, 25, 28, 31, 34],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18],

    seatTilePlacement: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ],

    // For a given seat number (in clockwise order, from 0 to 5),
    // contains the relative positions to modify around the home system
    // to insert the player's slice.
    seatTilePositions: {
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
  },
};
