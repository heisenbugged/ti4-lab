import { Map } from "~/types";

export const serializeMap = (map: Map) =>
  map.tiles.map((t) => t.system?.id.toString() ?? "0");
