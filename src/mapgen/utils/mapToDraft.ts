import { SystemId, Map, GameSet, SystemTile, OpenTile } from "~/types";
import { DraftType, DraftConfig } from "~/draft/types";
import { MapConfig } from "../mapConfigs";
import { mapStringOrder } from "~/data/mapStringOrder";

/**
 * Data passed via URL param when creating a draft from the map generator.
 */
export type SeededMapData = {
  slices: SystemId[][]; // Extracted slice system IDs
  presetMap: Map; // Center tiles (Mecatol, equidistants, hyperlanes)
  mapConfigId: string; // Original map config (milty6p, hyperlane8p, etc.)
  compatibleDraftTypes: DraftType[]; // Draft types that work with this map
  gameSets: GameSet[]; // Game sets used in map generation
};

/**
 * Map configs to compatible draft types.
 * Some map configs support multiple draft types (e.g., milty6p works with milty, miltyeq, heisen).
 */
export const mapConfigToCompatibleDraftTypes: Record<string, DraftType[]> = {
  milty6p: ["milty", "miltyeq", "heisen"],
  milty4p: ["milty4p", "miltyeq4p"],
  hyperlane4p: ["milty4p", "miltyeq4p"],
  std4p: ["std4p"],
  hyperlane5p: ["milty5p", "miltyeq5p"],
  hyperlane7p: ["milty7p", "miltyeq7p"],
  miltyeq7plarge: ["miltyeq7plarge"],
  hyperlane8p: ["milty8p", "miltyeq8p"],
};

/**
 * Extract slices from a generated map based on the draft config's seatTilePlacement.
 * This is the reverse of hydrateMap() - we're extracting tile data from map positions.
 *
 * @param map - The completed map from the map generator
 * @param mapConfig - The map configuration used
 * @param draftConfig - The draft configuration (defines seatTilePlacement)
 * @returns slices - Array of SystemId arrays, one per player
 * @returns sliceTileIndices - Set of map indices that were extracted (for building presetMap)
 */
export function extractSlicesFromMap(
  map: Map,
  mapConfig: MapConfig,
  draftConfig: DraftConfig,
): { slices: SystemId[][]; sliceTileIndices: Set<number> } {
  const slices: SystemId[][] = [];
  const sliceTileIndices = new Set<number>();

  for (let seatIdx = 0; seatIdx < mapConfig.numPlayers; seatIdx++) {
    const homeIdx = mapConfig.homeIdxInMapString[seatIdx];
    const homePos = mapStringOrder[homeIdx];
    const offsets = draftConfig.seatTilePlacement[seatIdx];
    const sliceSystems: SystemId[] = [];

    if (offsets) {
      for (const [ox, oy] of offsets) {
        // Calculate absolute hex position by adding offset to home position
        const targetPos = { x: homePos.x + ox, y: homePos.y + oy };

        // Find the tile at this position in the map
        const tileIdx = map.findIndex(
          (t) => t.position.x === targetPos.x && t.position.y === targetPos.y,
        );

        if (tileIdx !== -1 && map[tileIdx].type === "SYSTEM") {
          const systemTile = map[tileIdx] as SystemTile;
          sliceSystems.push(systemTile.systemId);
          sliceTileIndices.add(tileIdx);
        }
      }
    }

    slices.push(sliceSystems);
  }

  return { slices, sliceTileIndices };
}

/**
 * Build a preset map by converting extracted slice tiles to OPEN tiles.
 * The remaining SYSTEM tiles (Mecatol, equidistants, hyperlanes) become the preset map.
 *
 * @param map - The original map
 * @param sliceTileIndices - Set of indices that were extracted into slices
 * @returns The preset map with slice positions set to OPEN
 */
export function buildPresetMap(
  map: Map,
  sliceTileIndices: Set<number>,
): Map {
  return map.map((tile, idx) => {
    if (sliceTileIndices.has(idx)) {
      // Convert extracted slice tiles to OPEN
      return {
        idx: tile.idx,
        position: tile.position,
        type: "OPEN",
      } as OpenTile;
    }
    return tile;
  });
}

/**
 * Encode seeded map data as a base64 string for URL param.
 */
export function encodeSeededMapData(data: SeededMapData): string {
  return btoa(JSON.stringify(data));
}

/**
 * Decode seeded map data from a base64 URL param string.
 * Returns null if decoding fails.
 */
export function decodeSeededMapData(encoded: string): SeededMapData | null {
  try {
    return JSON.parse(atob(encoded)) as SeededMapData;
  } catch {
    return null;
  }
}
