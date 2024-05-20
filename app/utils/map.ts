import { mapStringOrder } from "~/data/mapStringOrder";
import { planetData } from "~/data/planetData";
import { systemData } from "~/data/systemData";
import { Draft, HomeTile, Map, TechSpecialty, Tile } from "~/types";

/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
const mapConfig = {
  standard: {
    // Represents the location of each home system (or 'seat') in the map string
    // ordered from 12 o'clock going clockwise
    //
    // these indexes assume mecatol is the first on the map string.
    // TODO: Double check that is how map string importing actually works.
    homeIdxInMapString: [28, 25, 22, 19, 34, 31],

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

export const MECATOL_TILE: Tile = {
  position: { x: 0, y: 0 },
  type: "SYSTEM",
  system: {
    id: 18,
    planets: planetData.filter((planet) => planet.name === "Mecatol Rex"),
  },
};

export const hydrateMap = (map: Map, draft: Draft): Map => {
  const hydrated: Tile[] = [...map.tiles];

  // add player data to home systems
  forHomeTiles(hydrated, (tile, homeIdx) => {
    const tileIdx = mapConfig.standard.homeIdxInMapString[homeIdx];
    hydrated[tileIdx] = hydrateHomeTile(tile, draft, homeIdx);
  });

  // Function to modify positions based on slices
  const applySlice = (tile: Tile, homeIdx: number) => {
    const player = draft.players.find((p) => p.seat === homeIdx);
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
  tiles.forEach((tile, idx) => {
    const homeSystemIdx = mapConfig.standard.homeIdxInMapString.indexOf(idx);
    if (homeSystemIdx !== -1) {
      fn(tile, homeSystemIdx);
    }
  });
};

const hydrateHomeTile = (
  tile: Tile,
  draft: Draft,
  seatIdx: number,
): HomeTile => {
  const player = draft.players.find((p) => p.seat === seatIdx);
  return { ...tile, type: "HOME", player };
};

export const parseMapString = (
  systems: string[],
  // TODO: Technically 'z' is superfluous, but it's easier to keep it in for now.
  positionOrder: { x: number; y: number; z: number }[] = mapStringOrder,
): Map => {
  const tiles: Tile[] = systems
    .map((n) => [n, systemData[parseInt(n)]] as const)
    .map(([id, system], idx) => {
      const position = positionOrder[idx];
      // empty home system is denoted by a -1 on the map string
      if (id === "-1")
        return {
          position,
          type: "HOME" as const,
          system: undefined,
        };

      if (!system)
        return {
          position,
          type: "OPEN" as const,
          system: undefined,
        };

      return {
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
