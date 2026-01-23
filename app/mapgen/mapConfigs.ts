import { SystemId, Map, SystemTile, HomeTile, OpenTile } from "~/types";
import { MapSize } from "~/draft/types";
import { mapStringOrder } from "~/data/mapStringOrder";
import {
  STANDARD_6P_HOME_POSITIONS,
  STANDARD_5P_HOME_POSITIONS,
  STANDARD_4P_HOME_POSITIONS,
} from "~/utils/mapGenerator";

/**
 * Simplified map configuration for the map generator.
 * Derived from DraftConfig but only includes map shape information,
 * not slice generation logic.
 */
export type MapConfig = {
  id: string;
  name: string;
  description: string;
  mapSize: MapSize;
  numPlayers: number;
  homeIdxInMapString: number[];
  presetTiles: Record<
    number,
    {
      systemId: SystemId;
      rotation?: number;
    }
  >;
  closedMapTiles: number[];
};

/**
 * Map configurations derived from draft configs.
 * We avoid duplicates where milty and miltyeq have the same map structure.
 */
export const mapConfigs: Record<string, MapConfig> = {
  milty6p: {
    id: "milty6p",
    name: "Standard 6p",
    description: "Standard 6-player map layout",
    mapSize: 3,
    numPlayers: 6,
    homeIdxInMapString: STANDARD_6P_HOME_POSITIONS,
    presetTiles: {},
    closedMapTiles: [],
  },
  milty5p: {
    id: "milty5p",
    name: "Standard 5p",
    description: "Standard 5-player map layout",
    mapSize: 3,
    numPlayers: 5,
    homeIdxInMapString: STANDARD_5P_HOME_POSITIONS,
    presetTiles: {},
    closedMapTiles: [],
  },
  milty4p: {
    id: "milty4p",
    name: "Standard 4p",
    description: "Standard 4-player map layout",
    mapSize: 3,
    numPlayers: 4,
    homeIdxInMapString: STANDARD_4P_HOME_POSITIONS,
    presetTiles: {},
    closedMapTiles: [],
  },
  hyperlane4p: {
    id: "hyperlane4p",
    name: "Hyperlane 4p",
    description: "4-player map layout with hyperlanes",
    mapSize: 3,
    numPlayers: 4,
    homeIdxInMapString: [25, 31, 34, 22],
    presetTiles: {
      1: { systemId: "85A", rotation: 180 },
      4: { systemId: "85A", rotation: 0 },
      8: {
        systemId: "87A",
        rotation: 180,
      },
      12: {
        systemId: "87A",
        rotation: 120,
      },
      14: {
        systemId: "87A",
        rotation: 0,
      },
      18: {
        systemId: "87A",
        rotation: 300,
      },
      19: { systemId: "85A", rotation: 180 },
      20: {
        systemId: "84A",
        rotation: 0,
      },
      27: {
        systemId: "84A",
        rotation: 120,
      },
      28: {
        systemId: "85A",
        rotation: 0,
      },
      29: {
        systemId: "84A",
        rotation: 0,
      },
      36: {
        systemId: "84A",
        rotation: 120,
      },
    },
    closedMapTiles: [],
  },
  std4p: {
    id: "std4p",
    name: "Small 4p",
    description: "Small 4-player map layout",
    mapSize: 3,
    numPlayers: 4,
    homeIdxInMapString: [27, 32, 36, 23],
    presetTiles: {},
    closedMapTiles: [19, 20, 21, 22, 25, 28, 29, 30, 31, 34],
  },
  hyperlane5p: {
    id: "hyperlane5p",
    name: "Hyperlane 5p",
    description: "5-player map layout with hyperlanes",
    mapSize: 3,
    numPlayers: 5,
    homeIdxInMapString: [19, 22, 25, 31, 34],
    presetTiles: {
      4: { systemId: "85A" },
      12: { systemId: "87A", rotation: 120 },
      14: { systemId: "87A" },
      27: { systemId: "83A" },
      28: { systemId: "85A" },
      29: { systemId: "83A", rotation: 240 },
    },
    closedMapTiles: [],
  },
  hyperlane7p: {
    id: "hyperlane7p",
    name: "Hyperlane 7p",
    description: "7-player map layout with hyperlanes",
    mapSize: 4,
    numPlayers: 7,
    homeIdxInMapString: [37, 22, 25, 49, 52, 55, 58],
    presetTiles: {
      4: { systemId: "84B" },
      5: { systemId: "89B" },
      27: { systemId: "86B" },
      1: { systemId: "83B" },
      20: { systemId: "85B" },
      33: { systemId: "88B", rotation: 120 },
    },
    closedMapTiles: [39, 40, 41, 42, 43, 44, 45, 46, 47, 53, 54, 57],
  },
  miltyeq7plarge: {
    id: "miltyeq7plarge",
    name: "Large 7p",
    description: "Large 7-player map layout",
    mapSize: 4,
    numPlayers: 7,
    homeIdxInMapString: [46, 49, 52, 56, 59, 39, 42],
    presetTiles: {},
    closedMapTiles: [37, 38, 41, 44, 45, 53, 54, 57, 60],
  },
  hyperlane8p: {
    id: "hyperlane8p",
    name: "Hyperlane 8p",
    description: "8-player map layout with hyperlanes",
    mapSize: 4,
    numPlayers: 8,
    homeIdxInMapString: [37, 40, 43, 46, 49, 52, 55, 58],
    presetTiles: {
      1: { systemId: "87A", rotation: 60 },
      2: { systemId: "89B", rotation: 180 },
      4: { systemId: "88A", rotation: 120 },
      5: { systemId: "90B" },
      24: { systemId: "83B", rotation: 120 },
      33: { systemId: "85B", rotation: 120 },
    },
    closedMapTiles: [41, 42, 45, 53, 54, 57],
  },
};

export const defaultMapConfigId = "milty6p";

/**
 * Generate an empty map from a map config.
 */
export function generateMapFromConfig(config: MapConfig): Map {
  const length = config.mapSize === 4 ? 61 : 37;

  const map: Map = Array.from({ length }, (_, idx) => {
    if (idx === 0) {
      const systemTile: SystemTile = {
        idx,
        type: "SYSTEM",
        systemId: "18",
        position: mapStringOrder[idx],
      };
      return systemTile;
    }

    if (config.homeIdxInMapString.includes(idx)) {
      const homeTile: HomeTile = {
        idx,
        type: "HOME",
        seat: config.homeIdxInMapString.indexOf(idx),
        position: mapStringOrder[idx],
      };
      return homeTile;
    }

    const openTile: OpenTile = {
      idx,
      type: "OPEN",
      position: mapStringOrder[idx],
    };
    return openTile;
  });

  // Close off tiles
  config.closedMapTiles.forEach((idx) => {
    map[idx].type = "CLOSED";
  });

  // Add preset tiles
  Object.entries(config.presetTiles).forEach(([idx, preset]) => {
    map[Number(idx)] = {
      ...map[Number(idx)],
      type: "SYSTEM",
      systemId: preset.systemId,
      rotation: preset.rotation,
    } as SystemTile;
  });

  return map;
}
