import { mapStringOrder } from "~/data/mapStringOrder";
import { planetData } from "~/data/planetData";
import { systemData } from "~/data/systemData";
import {
  Draft,
  HomeTile,
  Map,
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

export const MECATOL_TILE: Tile = {
  tileIdx: 0,
  position: { x: 0, y: 0 },
  type: "SYSTEM",
  system: {
    id: 18,
    planets: planetData.filter((planet) => planet.name === "Mecatol Rex"),
  },
};

export const hydrateMap = (
  map: Map,
  draft: Pick<Draft, "players" | "slices">,
): Map => {
  const hydrated: Tile[] = [...map.tiles];

  // add player data to home systems
  forHomeTiles(hydrated, (tile, homeIdx) => {
    const tileIdx = mapConfig.standard.homeIdxInMapString[homeIdx];
    hydrated[tileIdx] = hydrateHomeTile(tile, draft, homeIdx);
  });

  // Function to modify positions based on slices
  const applySlice = (tile: Tile, homeIdx: number) => {
    const player = draft.players.find((p) => p.seatIdx === homeIdx);
    if (!player || player.sliceIdx === undefined) return;
    const slice = draft.slices[player.sliceIdx];

    mapConfig.standard.seatTilePositions[homeIdx]?.forEach(
      ([x, y], sliceIdx) => {
        const pos = {
          x: tile.position.x + x,
          y: tile.position.y + y,
        };

        // find tile the matches the hexagonal coordinate position to modify
        const idxToModify = hydrated.findIndex(
          (t) => t.position.x === pos.x && t.position.y === pos.y,
        );

        // replace with new tile from slice.
        hydrated[idxToModify] = {
          tileIdx: idxToModify,
          position: pos,
          type: "SYSTEM",
          system: systemData[parseInt(slice[sliceIdx + 1])],
        };
      },
    );
  };

  // Iterate over home tiles to apply slices
  forHomeTiles(hydrated, applySlice);
  return { ...map, tiles: hydrated };
};

/**
 * Iterates over the home systems in the map, calling the provided function
 */
const forHomeTiles = (
  tiles: Tile[],
  fn: (tile: Tile, homeIdx: number) => void,
) => {
  console.log("tiles", tiles);
  tiles.forEach((tile, idx) => {
    const homeSystemIdx = mapConfig.standard.homeIdxInMapString.indexOf(idx);
    if (homeSystemIdx !== -1) {
      fn(tile, homeSystemIdx);
    }
  });
};

const hydrateHomeTile = (
  tile: Tile,
  draft: Pick<Draft, "players" | "slices">,
  seatIdx: number,
): HomeTile => {
  const player = draft.players.find((p) => p.seatIdx === seatIdx);
  return { ...tile, type: "HOME", player, seatIdx };
};

export const parseMapString = (
  systems: string[],
  positionOrder: TilePosition[] = mapStringOrder,
  includeMecatol = true,
): Map => {
  const rawSystems = includeMecatol ? ["18", ...systems] : systems;
  console.log("the raw systems are", rawSystems);
  const tiles: Tile[] = rawSystems
    .map((n) => [n, systemData[parseInt(n)]] as const)
    .map(([id, system], tileIdx) => {
      const position = positionOrder[tileIdx];
      const seatIdx = mapConfig.standard.homeIdxInMapString.indexOf(tileIdx);
      if (seatIdx >= 0 || id === "-1") {
        return {
          tileIdx,
          position,
          type: "HOME" as const,
          system: undefined,
          seatIdx,
        };
      }

      if (!system)
        return {
          tileIdx,
          position,
          type: "OPEN" as const,
          system: undefined,
        };

      return {
        tileIdx,
        position,
        type: "SYSTEM",
        system,
      };
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
