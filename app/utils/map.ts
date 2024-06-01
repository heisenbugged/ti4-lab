import { mapStringOrder } from "~/data/mapStringOrder";
import { systemData } from "~/data/systemData";
import { DraftConfig } from "~/draft/types";
import {
  HomeTile,
  Map,
  Player,
  Slice,
  System,
  TechSpecialty,
  Tile,
  TilePosition,
} from "~/types";

/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */

export const playerSpeakerOrder = [
  "Speaker",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
];
export const playerLetters = ["a", "b", "c", "d", "e", "f"];

export const isTileModifiable = (config: DraftConfig, tileIdx: number) =>
  config.modifiableMapTiles.includes(tileIdx);

export const hydrateMap = (
  config: DraftConfig,
  map: Map,
  players: Player[],
  slices: Slice[],
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

    config.seatTilePlacement[homeIdx]?.forEach(([x, y], sliceIdx) => {
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
        system: systemData[slice[sliceIdx + 1]],
      };
    });
  });

  return hydrated;
};

/**
 * Iterates over the home systems in the map, calling the provided function
 */
const forHomeTiles = (
  config: DraftConfig,
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
  config: DraftConfig,
  map: Map,
): { map: Map; slices: Slice[] } => {
  const tiles = [...map];
  const slices: Slice[] = [];
  config.homeIdxInMapString.forEach((tileIdx, seatIdx) => {
    const homeTile = tiles[tileIdx];
    const slice: Slice = [-1];
    config.seatTilePlacement[seatIdx]?.forEach(([x, y]) => {
      const pos = { x: homeTile.position.x + x, y: homeTile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const tileToModify = tiles.find(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      )!;
      if (tileToModify.system) {
        slice.push(tileToModify.system?.id);
      } else {
        slice.push(0);
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
    map: tiles,
    slices,
  };
};

export const parseMapString = (
  config: DraftConfig,
  systems: number[],
  positionOrder: TilePosition[] = mapStringOrder,
  includeMecatol = true,
): Map => {
  const rawSystems = includeMecatol ? [18, ...systems] : systems;
  const map: Map = rawSystems
    .map((n) => [n, systemData[n]] as const)
    .map(([id, system], idx) => {
      const position = positionOrder[idx];
      const seatIdx = config.homeIdxInMapString.indexOf(idx);
      const baseAttrs = { id, idx, seatIdx, position, system };
      // TODO: -1 is generally interpreted as 'empty' by other tools.
      // FIX THIS.
      if (seatIdx >= 0 || id === -1) {
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

export const systemsInSlice = (slice: Slice): System[] =>
  slice.reduce((acc, t) => {
    const system = systemData[t];
    if (!system) return acc;
    acc.push(system);
    return acc;
  }, [] as System[]);

const MECATOL_REX_ID = 18;
export function tileColor(system: System): "RED" | "BLUE" | undefined {
  if (system.id == MECATOL_REX_ID) return undefined;
  if (system.planets.length === 0) return "RED";
  if (system.anomaly) return "RED";
  return "BLUE";
}
