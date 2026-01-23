import { mapStringOrder } from "~/data/mapStringOrder";
import { Map, OpenTile, SystemTile, HomeTile } from "~/types";

export const STANDARD_6P_HOME_POSITIONS = [19, 22, 25, 28, 31, 34];
export const STANDARD_5P_HOME_POSITIONS = [22, 25, 28, 32, 36];
export const STANDARD_4P_HOME_POSITIONS = [23, 27, 32, 36];

/**
 * Generates a standard empty map with Mecatol Rex at center and HOME tiles at specified positions.
 * Does not depend on any draft configuration.
 */
function generateStandardMap(homePositions: number[]): Map {
  // Standard map is 3 rings (37 tiles total)
  const length = 37;

  const map: Map = Array.from({ length }, (_, idx) => {
    // Center tile is always Mecatol Rex (system 18)
    if (idx === 0) {
      const systemTile: SystemTile = {
        idx,
        type: "SYSTEM",
        systemId: "18",
        position: mapStringOrder[idx],
      };
      return systemTile;
    }

    // Home system positions
    if (homePositions.includes(idx)) {
      const homeTile: HomeTile = {
        idx,
        type: "HOME",
        seat: homePositions.indexOf(idx),
        position: mapStringOrder[idx],
      };
      return homeTile;
    }

    // All other tiles are open
    const openTile: OpenTile = {
      idx,
      type: "OPEN",
      position: mapStringOrder[idx],
    };
    return openTile;
  });

  return map;
}

export function generateStandard6pMap(): Map {
  return generateStandardMap(STANDARD_6P_HOME_POSITIONS);
}

export function generateStandard5pMap(): Map {
  return generateStandardMap(STANDARD_5P_HOME_POSITIONS);
}

export function generateStandard4pMap(): Map {
  return generateStandardMap(STANDARD_4P_HOME_POSITIONS);
}
