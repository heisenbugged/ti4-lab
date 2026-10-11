import { generateHexRings } from "~/utils/hexCoordinates";

/**
 * Standard map string order for up to 4 rings (61 tiles).
 * Generated mathematically using cube coordinates.
 *
 * For backward compatibility, this exports the same structure as before.
 * New code should use generateHexRings() directly for dynamic ring counts.
 */
export const mapStringOrder = generateHexRings(4);
