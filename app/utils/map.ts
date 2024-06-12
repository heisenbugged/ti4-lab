import { mapStringOrder } from "~/data/mapStringOrder";
import { systemData } from "~/data/systemData";
import { DraftConfig } from "~/draft/types";
import {
  DraftSlice,
  HomeTileRef,
  Map,
  MapV2,
  PlayerSelection,
  Slice,
  System,
  SystemId,
  TechSpecialty,
  TilePosition,
  TileRef,
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

export function hydrateMap(
  config: DraftConfig,
  map: MapV2,
  slices: DraftSlice[],
  selections: PlayerSelection[],
): MapV2 {
  const hydrated: MapV2 = [...map];

  // add player data to home systems
  forHomeTiles(config, hydrated, (tile, homeIdx) => {
    const tileIdx = config.homeIdxInMapString[homeIdx];
    hydrated[tileIdx] = hydrateHomeTile(tile, homeIdx, selections);
  });

  // Iterate over home tiles to apply slices
  forHomeTiles(config, hydrated, (tile, homeIdx) => {
    const selection = selections.find((s) => s.seatIdx === homeIdx);
    if (!selection || selection.sliceIdx === undefined) return;

    const slice = slices[selection.sliceIdx];
    if (!slice) return;

    config.seatTilePlacement[homeIdx]?.forEach(([x, y], sliceIdx) => {
      const pos = { x: tile.position.x + x, y: tile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const idxToModify = hydrated.findIndex(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      );

      const sliceTile = slice.tiles[sliceIdx + 1];
      if (sliceTile.type === "SYSTEM") {
        // replace with new tile from slice.
        hydrated[idxToModify] = {
          idx: idxToModify,
          position: pos,
          type: "SYSTEM",
          systemId: sliceTile.systemId,
        };
      }
    });
  });

  return hydrated;
}

/**
 * Iterates over the home systems in the map, calling the provided function
 */

const forHomeTiles = (
  config: DraftConfig,
  tiles: TileRef[],
  fn: (tile: TileRef, homeIdx: number) => void,
) => {
  tiles.forEach((tile, idx) => {
    const homeSystemIdx = config.homeIdxInMapString.indexOf(idx);
    if (homeSystemIdx !== -1) {
      fn(tile, homeSystemIdx);
    }
  });
};

const hydrateHomeTile = (
  tile: TileRef,
  seatIdx: number,
  selections: PlayerSelection[],
): HomeTileRef => {
  const selection = selections.find((s) => s.seatIdx === seatIdx);
  const homeTile: HomeTileRef = {
    idx: tile.idx,
    position: tile.position,
    type: "HOME",
    seat: seatIdx,
    playerId: selection?.playerId,
  };

  return homeTile;
};

export const sliceMap = (
  config: DraftConfig,
  map: Map,
): { map: Map; slices: Slice[] } => {
  const tiles = [...map];
  const slices: Slice[] = [];
  config.homeIdxInMapString.forEach((tileIdx, seatIdx) => {
    const homeTile = tiles[tileIdx];
    const slice: Slice = ["-1"];
    config.seatTilePlacement[seatIdx]?.forEach(([x, y]) => {
      const pos = { x: homeTile.position.x + x, y: homeTile.position.y + y };
      // find tile the matches the hexagonal coordinate position to modify
      const tileToModify = tiles.find(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      )!;
      if (tileToModify.system) {
        slice.push(tileToModify.system?.id);
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
    map: tiles,
    slices,
  };
};

export const parseMapString = (
  config: DraftConfig,
  systems: SystemId[],
  positionOrder: TilePosition[] = mapStringOrder,
  includeMecatol = true,
): Map => {
  const rawSystems = includeMecatol ? ["18", ...systems] : systems;
  const map: Map = rawSystems
    .map((n) => [n, systemData[n]] as const)
    .map(([id, system], idx) => {
      const position = positionOrder[idx];
      const seatIdx = config.homeIdxInMapString.indexOf(idx);
      const baseAttrs = { id, idx, seatIdx, position, system };
      // TODO: -1 is generally interpreted as 'empty' by other tools.
      // FIX THIS.
      if (seatIdx >= 0 || id === "-1") {
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
      if (p.tech) acc.push(p.tech);
    });
    return acc;
  }, [] as TechSpecialty[]);

export const systemsInSliceOld = (slice: Slice): System[] =>
  slice.reduce((acc, t) => {
    const system = systemData[t];
    if (!system) return acc;
    acc.push(system);
    return acc;
  }, [] as System[]);

export const emptySliceOld = (numSystems: number): Slice => [
  "-1",
  ...Array.from({ length: numSystems }, () => "0"),
];

export const emptySlicesOld = (
  numSlices: number,
  numSystems: number,
): Slice[] =>
  Array.from({ length: numSlices }, () => emptySliceOld(numSystems));

export const normalizeSliceOld = (slice: Slice): Slice => {
  if (slice[0] === "-1") return slice;
  return ["-1", ...slice];
};

export function generateEmptyMap(config: DraftConfig): MapV2 {
  return Array.from({ length: 37 }, (_, idx) => {
    if (idx === 0)
      return {
        idx,
        type: "SYSTEM",
        systemId: "18",
        position: mapStringOrder[idx],
      };

    if (config.homeIdxInMapString.includes(idx)) {
      return {
        idx,
        type: "HOME",
        seat: config.homeIdxInMapString.indexOf(idx),
        position: mapStringOrder[idx],
      };
    }

    return { idx, type: "OPEN", position: mapStringOrder[idx] };
  });
}
