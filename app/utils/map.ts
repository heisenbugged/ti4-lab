import { mapStringOrder } from "~/data/mapStringOrder";
import { factionSystems } from "~/data/systemData";
import { DraftConfig } from "~/draft/types";
import {
  Slice,
  HomeTile,
  Map,
  PlayerSelection,
  System,
  TechSpecialty,
  Tile,
  SystemTile,
  DemoTile,
  PlayerDemoTile,
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
const miltyEqLeftEquidistants = [8, 10, 12, 14, 16, 18];
export const playerLetters = ["a", "b", "c", "d", "e", "f"];

export const isTileModifiable = (config: DraftConfig, tileIdx: number) =>
  config.modifiableMapTiles.includes(tileIdx);

export function hydrateDemoMap(config: DraftConfig) {
  const hydrated = generateEmptyMap(config);
  const demoTiles: DemoTile[] = Array.from(
    { length: hydrated.length },
    (_, idx) => ({
      idx,
      position: hydrated[idx].position,
      type: "OPEN",
    }),
  );
  // add mecatol
  demoTiles[0] = { ...(hydrated[0] as SystemTile) };

  forHomeTiles(config, hydrated, (tile, homeIdx) => {
    const playerDemoTile: PlayerDemoTile = {
      idx: tile.idx,
      position: tile.position,
      type: "PLAYER_DEMO",
      playerNumber: homeIdx,
      isHomeSystem: false,
    };

    const homeTileIdx = config.homeIdxInMapString[homeIdx];
    demoTiles[homeTileIdx] = {
      ...playerDemoTile,
      isHomeSystem: true,
    };

    config.seatTilePlacement[homeIdx]?.forEach(([x, y]) => {
      const pos = { x: tile.position.x + x, y: tile.position.y + y };
      const idxToModify = hydrated.findIndex(
        (t) => t.position.x === pos.x && t.position.y === pos.y,
      );
      demoTiles[idxToModify] = {
        ...playerDemoTile,
        idx: idxToModify,
        position: pos,
      };
    });
  });

  // insert preset tiles
  Object.entries(config.presetTiles).forEach(([idx, preset]) => {
    demoTiles[Number(idx)] = {
      ...hydrated[Number(idx)],
      type: "SYSTEM",
      systemId: preset.systemId,
      rotation: preset.rotation,
    };
  });

  // set closed tiles to 'x'
  config.closedMapTiles.forEach((idx) => {
    demoTiles[idx] = {
      idx: hydrated[idx].idx,
      position: hydrated[idx].position,
      type: "CLOSED",
    };
  });

  return demoTiles;
}

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
          rotation: sliceTile.rotation,
        };
      }
    });
  });

  // add minor factions to left equidistsant
  selections.forEach((selection) => {
    if (
      selection.minorFaction !== undefined &&
      selection.seatIdx !== undefined
    ) {
      const idx = miltyEqLeftEquidistants[selection.seatIdx];
      const factionSystem = factionSystems[selection.minorFaction];
      // council keleres has no system, so we skip it.
      if (factionSystem) {
        hydrated[idx] = {
          ...hydrated[idx],
          type: "SYSTEM",
          systemId: factionSystems[selection.minorFaction].id,
        };
      }
    }
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
  const length = config.mapSize === 4 ? 61 : 37;

  const map: Map = Array.from({ length }, (_, idx) => {
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

  // close off tiles
  config.closedMapTiles.forEach((idx) => {
    map[idx].type = "CLOSED";
  });

  // add preset tiles
  Object.entries(config.presetTiles).forEach(([idx, preset]) => {
    map[Number(idx)] = {
      ...map[Number(idx)],
      type: "SYSTEM",
      systemId: preset.systemId,
      rotation: preset.rotation,
    };
  });

  return map;
}
