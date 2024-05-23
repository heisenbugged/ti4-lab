import { FactionId, Map, Player } from "~/types";

type DraftToSerialize = {
  players: Player[];
  factions: FactionId[];
  mapString: string[];
  slices: string[][];
};

export const serializeDraft = (draft: DraftToSerialize) => {
  return {
    players: draft.players,
    availableFactions: draft.factions,
    mapString: draft.mapString.join(" "),
    slices: draft.slices,
  };
};

export const serializeMap = (map: Map) =>
  map.tiles.map((t) => t.system?.id.toString() ?? "0");
