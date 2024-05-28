import { mapStringOrder } from "~/data/mapStringOrder";
import { systemData } from "~/data/systemData";
import {
  HomeTile,
  Map,
  Player,
  System,
  TechSpecialty,
  Tile,
  TilePosition,
} from "~/types";

/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
export type MapConfig = {
  homeIdxInMapString: number[];
  modifiableMapTiles: number[];
  seatTilePlacement: TilePosition[];
  seatTilePositions: Record<number, [number, number][]>;
  numSystemsInSlice: number;
  sliceHeight: number;
};

// const slicePositionOrder = [
//   { x: 0, y: 0, z: 0 },
//   { x: -1, y: 0, z: 0 },
//   { x: 0, y: -1, z: 0 },
//   { x: 1, y: -1, z: 0 },
//   // additional two slices for full milty draft
//   // { x: -1, y: -1, z: 0 },
//   // { x: 0, y: -2, z: 0 },
// ];

type MapConfigType = "standard" | "miltyeq" | "milty";
export const mapConfig: Record<MapConfigType, MapConfig> = {
  miltyeq: {
    numSystemsInSlice: 4,
    sliceHeight: 3,

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
    numSystemsInSlice: 5,
    sliceHeight: 3,

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
  standard: {
    numSystemsInSlice: 3,
    sliceHeight: 2,
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

export const isTileModifiable = (config: MapConfig, tileIdx: number) =>
  config.modifiableMapTiles.includes(tileIdx);

export const hydrateMap = (
  config: MapConfig,
  map: Map,
  players: Player[],
  slices: string[][],
): Map => {
  const hydrated: Map = [...map];

  // add player data to home systems
  forHomeTiles(config, hydrated, (tile, homeIdx) => {
    const tileIdx = config.homeIdxInMapString[homeIdx];
    hydrated[tileIdx] = hydrateHomeTile(tile, players, homeIdx);
  });

  // Iterate over home tiles to apply slices
  forHomeTiles(config, hydrated, (tile, homeIdx) => {
    const player = players.find((p) => p.seatIdx === homeIdx);
    if (!player || player.sliceIdx === undefined) return;
    const slice = slices[player.sliceIdx];

    config.seatTilePositions[homeIdx]?.forEach(([x, y], sliceIdx) => {
      const pos = { x: tile.position.x + x, y: tile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const idxToModify = hydrated.findIndex(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      );

      // replace with new tile from slice.
      hydrated[idxToModify] = {
        idx: idxToModify,
        position: pos,
        type: "SYSTEM",
        system: systemData[parseInt(slice[sliceIdx + 1])],
      };
    });
  });

  return hydrated;
};

/**
 * Iterates over the home systems in the map, calling the provided function
 */
const forHomeTiles = (
  config: MapConfig,
  tiles: Tile[],
  fn: (tile: Tile, homeIdx: number) => void,
) => {
  tiles.forEach((tile, idx) => {
    const homeSystemIdx = config.homeIdxInMapString.indexOf(idx);
    if (homeSystemIdx !== -1) {
      fn(tile, homeSystemIdx);
    }
  });
};

const hydrateHomeTile = (
  tile: Tile,
  players: Player[],
  seatIdx: number,
): HomeTile => {
  const player = players.find((p) => p.seatIdx === seatIdx);
  return { ...tile, type: "HOME", player, seatIdx };
};

export const sliceMap = (
  config: MapConfig,
  map: Map,
): { map: Map; slices: string[][] } => {
  const tiles = [...map];
  const slices: string[][] = [];
  config.homeIdxInMapString.forEach((tileIdx, seatIdx) => {
    const homeTile = tiles[tileIdx];
    const slice: string[] = ["-1"];
    config.seatTilePositions[seatIdx]?.forEach(([x, y]) => {
      const pos = { x: homeTile.position.x + x, y: homeTile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const tileToModify = tiles.find(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      )!!;
      if (tileToModify.system) {
        slice.push(tileToModify.system?.id.toString());
      } else {
        slice.push("0");
      }
      console.log("the slice is", slice);

      tiles[tileToModify.idx] = {
        position: tileToModify.position,
        type: "OPEN",
        idx: tileToModify.idx,
        system: undefined,
      };
    });
    slices.push(slice);
  });

  console.log("the slices are", slices);

  return {
    map: tiles,
    slices,
  };
};

export const playerLetters = ["a", "b", "c", "d", "e", "f", "g"];
export const playerSpeakerOrder = [
  "Speaker",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
];

export const parseMapString = (
  config: MapConfig,
  systems: string[],
  positionOrder: TilePosition[] = mapStringOrder,
  includeMecatol = true,
): Map => {
  const rawSystems = includeMecatol ? ["18", ...systems] : systems;
  const map: Map = rawSystems
    .map((n) => [n, systemData[parseInt(n)]] as const)
    .map(([id, system], idx) => {
      const position = positionOrder[idx];
      const seatIdx = config.homeIdxInMapString.indexOf(idx);
      const baseAttrs = { id, idx, seatIdx, position, system };
      const playerNo = playerLetters.findIndex((l) => id.includes(l));
      const isHomeSystem = seatIdx >= 0 || id === "-1";

      if (playerNo >= 0) {
        return {
          ...baseAttrs,
          type: "PLAYER_DEMO" as const,
          playerNumber: playerNo,
          isHomeSystem,
        };
      } else if (seatIdx >= 0 || id === "-1") {
        return { ...baseAttrs, type: "HOME" as const };
      } else if (system) {
        return { ...baseAttrs, type: "SYSTEM" };
      } else {
        return { ...baseAttrs, type: "OPEN" as const };
      }
    });

  return map;
};

export const totalStatsForSystems = (systems: System[]) =>
  systems.reduce(
    (acc, s) => {
      acc.resources += s.totalSpend.resources;
      acc.influence += s.totalSpend.influence;

      return acc;
    },
    { resources: 0, influence: 0 },
  );

export const optimalStatsForSystems = (systems: System[]) =>
  systems.reduce(
    (acc, s) => {
      acc.resources += s.optimalSpend.resources;
      acc.influence += s.optimalSpend.influence;
      acc.flex += s.optimalSpend.flex;
      return acc;
    },
    { resources: 0, influence: 0, flex: 0 },
  );

export const techSpecialtiesForSystems = (systems: System[]) =>
  systems.reduce((acc, s) => {
    s.planets.forEach((p) => {
      if (p.techSpecialty) acc.push(p.techSpecialty);
    });
    return acc;
  }, [] as TechSpecialty[]);

export const systemsInSlice = (slice: string[]): System[] =>
  slice.reduce((acc, t) => {
    const system = systemData[parseInt(t)];
    if (!system) return acc;
    acc.push(system);
    return acc;
  }, [] as System[]);
