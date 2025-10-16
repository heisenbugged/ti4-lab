import { mapStringOrder } from "~/data/mapStringOrder";
import { Map, OpenTile, SystemTile, HomeTile } from "~/types";

// Standard Milty 6p home system positions (rings 2-3)
const MILTY_6P_HOME_POSITIONS = [19, 22, 25, 28, 31, 34];

/**
 * Generates a standard 6-player empty map with Mecatol Rex at center
 * and HOME tiles at Milty positions.
 * Does not depend on any draft configuration.
 */
export function generateStandard6pMap(): Map {
  // Standard 6p map is 3 rings (37 tiles total)
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
    if (MILTY_6P_HOME_POSITIONS.includes(idx)) {
      const homeTile: HomeTile = {
        idx,
        type: "HOME",
        seat: MILTY_6P_HOME_POSITIONS.indexOf(idx),
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
