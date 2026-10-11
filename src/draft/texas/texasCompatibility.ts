import { draftConfig } from "~/draft/draftConfig";
import { generateEmptyMap } from "~/utils/map";
import { DraftType } from "~/types";

/** Tiles each player drafts in Texas style (3 blue + 2 red). */
export const TEXAS_TILES_PER_PLAYER = 5;

/**
 * Texas style deals a fixed hand per player, so the map must have exactly
 * that many open slots per player or the galaxy build can't be completed.
 */
export function getTexasSlotCounts(type: DraftType) {
  const config = draftConfig[type];
  const openSlots = generateEmptyMap(config).filter(
    (tile) => tile.type === "OPEN",
  ).length;
  const dealtTiles = config.numPlayers * TEXAS_TILES_PER_PLAYER;
  return { openSlots, dealtTiles, supported: openSlots === dealtTiles };
}

export function supportsTexasStyle(type: DraftType): boolean {
  return getTexasSlotCounts(type).supported;
}
