import { createFileRoute } from "@tanstack/react-router";
import { MapGenerator } from "~/mapgen/components/MapGenerator";

export const Route = createFileRoute("/map-generator")({
  // A shared generator link carries the map as ?map=<map string>.
  validateSearch: (search): { map?: string } => ({
    map: search.map == null ? undefined : String(search.map),
  }),
  component: MapGenerator,
});
