import { useDraft } from "~/draftStore";
import { useDraftConfig } from "./useDraftConfig";
import { hydrateMap } from "~/utils/map";
import { PlayerSelection } from "~/types";
import { useMemo } from "react";

export function useDraftValidationErrors() {
  const config = useDraftConfig();
  const presetMap = useDraft((state) => state.draft.presetMap);
  const numFactions = useDraft((state) => state.draft.settings.numFactions);
  const allowEmptyMapTiles = useDraft(
    (state) => state.draft.settings.allowEmptyTiles,
  );
  const slices = useDraft((state) => state.draft.slices);
  const players = useDraft((state) => state.draft.players);

  return useMemo(() => {
    const errors = [];

    if (numFactions !== undefined && numFactions < players.length) {
      errors.push(
        "Number of factions to draft must be at least the number of players",
      );
    }

    slices.forEach((slice) => {
      if (slice.tiles.some((t) => t.type === "OPEN")) {
        errors.push(`${slice.name} has empty tiles`);
      }
    });

    const selections: PlayerSelection[] = players.map((p, idx) => ({
      playerId: p.id,
      seatIdx: idx,
      sliceIdx: idx,
    }));

    // we pretend as if all players have seated.
    const hydratedMap = hydrateMap(config, presetMap, slices, selections);

    if (
      !allowEmptyMapTiles &&
      hydratedMap.some((tile) => tile.type === "OPEN")
    ) {
      errors.push("Map has empty tiles");
    }

    return errors;
  }, [config, presetMap, numFactions, allowEmptyMapTiles, slices, players]);
}
