import { mapStringOrder } from "~/data/mapStringOrder";
import { systemData } from "~/data/systemData";
import {
  HomeTile,
  Map,
  Player,
  TechSpecialty,
  Tile,
  TilePosition,
} from "~/types";

/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
export const mapConfig = {
  standard: {
    // Represents the location of each home system (or 'seat') in the map string (w/ mecatol included)
    // ordered from 12 o'clock going clockwise
    homeIdxInMapString: [28, 25, 22, 19, 34, 31],

    // tiles that are directly modifiable on the map (i.e. not part of a slice)
    modifiableMapTiles: [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18],

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

export const isTileModifiable = (tileIdx: number) =>
  mapConfig.standard.modifiableMapTiles.includes(tileIdx);

export const hydrateMap = (
  map: Map,
  players: Player[],
  slices: string[][],
): Map => {
  const hydrated: Tile[] = [...map.tiles];

  // add player data to home systems
  forHomeTiles(hydrated, (tile, homeIdx) => {
    const tileIdx = mapConfig.standard.homeIdxInMapString[homeIdx];
    hydrated[tileIdx] = hydrateHomeTile(tile, players, homeIdx);
  });

  // Iterate over home tiles to apply slices
  forHomeTiles(hydrated, (tile, homeIdx) => {
    const player = players.find((p) => p.seatIdx === homeIdx);
    if (!player || player.sliceIdx === undefined) return;
    const slice = slices[player.sliceIdx];

    mapConfig.standard.seatTilePositions[homeIdx]?.forEach(
      ([x, y], sliceIdx) => {
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
      },
    );
  });

  return { ...map, tiles: hydrated };
};

/**
 * Iterates over the home systems in the map, calling the provided function
 */
const forHomeTiles = (
  tiles: Tile[],
  fn: (tile: Tile, homeIdx: number) => void,
) => {
  tiles.forEach((tile, idx) => {
    const homeSystemIdx = mapConfig.standard.homeIdxInMapString.indexOf(idx);
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

export const sliceMap = (map: Map): { map: Map; slices: string[][] } => {
  const tiles = [...map.tiles];
  const slices: string[][] = [];
  mapConfig.standard.homeIdxInMapString.forEach((tileIdx, seatIdx) => {
    const homeTile = tiles[tileIdx];
    const slice: string[] = ["-1"];
    mapConfig.standard.seatTilePositions[seatIdx]?.forEach(([x, y]) => {
      const pos = { x: homeTile.position.x + x, y: homeTile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const tileToModify = tiles.find(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      )!!; // TODO: Handle if tile not found

      if (tileToModify.system) {
        slice.push(tileToModify.system?.id.toString());
      } else {
        slice.push("0");
      }

      tiles[tileToModify.idx] = {
        position: tileToModify.position,
        type: "OPEN",
        idx: tileToModify.idx,
        system: undefined,
      };
    });
    slices.push(slice);
  });

  return {
    map: { tiles },
    slices,
  };
};

export const parseMapString = (
  systems: string[],
  positionOrder: TilePosition[] = mapStringOrder,
  includeMecatol = true,
): Map => {
  const rawSystems = includeMecatol ? ["18", ...systems] : systems;
  const tiles: Tile[] = rawSystems
    .map((n) => [n, systemData[parseInt(n)]] as const)
    .map(([id, system], idx) => {
      const position = positionOrder[idx];
      const seatIdx = mapConfig.standard.homeIdxInMapString.indexOf(idx);

      const baseAttrs = { id, idx, seatIdx, position, system };
      if (seatIdx >= 0 || id === "-1") {
        return { ...baseAttrs, type: "HOME" as const };
      } else if (system) {
        return { ...baseAttrs, type: "SYSTEM" };
      } else {
        return { ...baseAttrs, type: "OPEN" as const };
      }
    });

  return { tiles };
};

export const totalStats = (tiles: Tile[]) =>
  tiles.reduce(
    (acc, t) => {
      t.system?.planets.forEach((p) => {
        acc.resources += p.resources;
        acc.influence += p.influence;
      });
      return acc;
    },
    { resources: 0, influence: 0 },
  );

export const optimalStats = (tiles: Tile[]) =>
  tiles.reduce(
    (acc, t) => {
      t.system?.planets.forEach((p) => {
        if (p.resources > p.influence) {
          acc.resources += p.resources;
        } else if (p.resources < p.influence) {
          acc.influence += p.influence;
        } else if (p.resources === p.influence) {
          acc.flex += p.resources;
        }
      });
      return acc;
    },
    { resources: 0, influence: 0, flex: 0 },
  );

export const techSpecialties = (tiles: Tile[]) =>
  tiles.reduce((acc, t) => {
    t.system?.planets.forEach((p) => {
      if (p.techSpecialty) acc.push(p.techSpecialty);
    });
    return acc;
  }, [] as TechSpecialty[]);
