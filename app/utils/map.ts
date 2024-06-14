import { mapStringOrder } from "~/data/mapStringOrder";
import { DraftConfig } from "~/draft/types";
import {
  Slice,
  HomeTile,
  Map,
  PlayerSelection,
  System,
  TechSpecialty,
  Tile,
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
  map: Map,
  slices: Slice[],
  selections: PlayerSelection[],
): Map {
  const hydrated: Map = [...map];

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
  seatIdx: number,
  selections: PlayerSelection[],
): HomeTile => {
  const selection = selections.find((s) => s.seatIdx === seatIdx);
  const homeTile: HomeTile = {
    idx: tile.idx,
    position: tile.position,
    type: "HOME",
    seat: seatIdx,
    playerId: selection?.playerId,
  };

  return homeTile;
};

// Legacy code for splitting map up
// export const sliceMap = (
//   config: DraftConfig,
//   map: Map,
// ): { map: Map; slices: SystemIds[] } => {
//   const tiles = [...map];
//   const slices: SystemIds[] = [];
//   config.homeIdxInMapString.forEach((tileIdx, seatIdx) => {
//     const homeTile = tiles[tileIdx];
//     const slice: SystemIds = ["-1"];
//     config.seatTilePlacement[seatIdx]?.forEach(([x, y]) => {
//       const pos = { x: homeTile.position.x + x, y: homeTile.position.y + y };
//       // find tile the matches the hexagonal coordinate position to modify
//       const tileToModify = tiles.find(
//         (t) => t.position.x === pos.x && t.position.y === pos.y,
//       )!;
//       if (tileToModify.system) {
//         slice.push(tileToModify.system?.id);
//       } else {
//         slice.push("0");
//       }

//       tiles[tileToModify.idx] = {
//         position: tileToModify.position,
//         type: "OPEN",
//         idx: tileToModify.idx,
//         system: undefined,
//       };
//     });
//     slices.push(slice);
//   });

//   return {
//     map: tiles,
//     slices,
//   };
// };

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

export function generateEmptyMap(config: DraftConfig): Map {
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
