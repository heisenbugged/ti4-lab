import { mapStringOrder } from "~/data/mapStringOrder";
import { planetData } from "~/data/planetData";
import { systemData } from "~/data/systemData";
import { Draft, HomeTile, Map, TechSpecialty, Tile } from "~/types";

export const MECATOL_TILE: Tile = {
  position: { x: 0, y: 0, z: 0 },
  type: "SYSTEM",
  system: {
    id: 18,
    planets: planetData.filter((planet) => planet.name === "Mecatol Rex"),
  },
};

/**
 * For a given seat number (in clockwise order, from 1 to 6), this object
 * contains the relative positions to modify around the home system
 * to insert the player's slice.
 */
const posToModify: Record<number, number[][]> = {
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
};

export const hydrateMap = (map: Map, draft: Draft): Map => {
  let homeSystemIdx = 0;
  const hydrated: Tile[] = [];

  // add player data to home systems
  map.tiles.forEach((tile) => {
    if (tile.type === "HOME") {
      hydrated.push(hydrateHomeTile(tile, draft, homeSystemIdx));
      homeSystemIdx += 1;
      return;
    }

    // otherwise
    hydrated.push(tile);
  });

  // Function to modify positions based on slices
  const applySlice = (tile: Tile, homeIdx: number) => {
    const player = draft.players.find((p) => p.seat === homeIdx);
    if (!player || player.sliceIdx === undefined) return;
    const slice = draft.slices[player.sliceIdx].split(" ");

    posToModify[homeIdx]?.forEach(([x, y], sliceIdx) => {
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
    });
  };

  // Iterate over home tiles to apply slices
  forHomeTiles(hydrated, applySlice);
  return { ...map, tiles: hydrated };
};

// Order of home systems in the map string
// (0-indexed, starting from 12 o'clock going clockwise)
const homeSystemOrder = [3, 2, 1, 0, 5, 4];

/**
 * Iterates over the home systems in the map, calling the provided function
 */
const forHomeTiles = (
  tiles: Tile[],
  fn: (tile: HomeTile, homeIdx: number) => void,
) => {
  let homeSystemIdx = 0;
  tiles.forEach((tile, idx) => {
    if (tile.type === "HOME") {
      fn(tile, homeSystemOrder[homeSystemIdx]);
      homeSystemIdx += 1;
    }
  });
};

const hydrateHomeTile = (
  tile: HomeTile,
  draft: Draft,
  homeSystemIdx: number,
): Tile => {
  const player = draft.players.find(
    (p) => p.seat === homeSystemOrder[homeSystemIdx],
  );
  if (!player) return tile;
  return { ...tile, player };
};

export const parseMapString = (
  mapString: string,
  // TODO: Technically 'z' is superfluous, but it's easier to keep it in for now.
  positionOrder: { x: number; y: number; z: number }[] = mapStringOrder,
): Map => {
  const tiles: Tile[] = mapString
    .split(" ")
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
