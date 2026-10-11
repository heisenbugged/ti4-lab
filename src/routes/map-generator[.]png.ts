import { createFileRoute } from "@tanstack/react-router";
import { pngResponse } from "~/utils/imageResponse.server";
import { generateMapGeneratorImageBuffer } from "~/skiaRendering/mapGeneratorImage.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";

export const Route = createFileRoute("/map-generator.png")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mapParam = url.searchParams.get("map");

        if (!mapParam) {
          return new Response("map parameter required", { status: 400 });
        }

        const decoded = decodeMapString(mapParam);
        if (!decoded) {
          return new Response("Invalid map string format", { status: 400 });
        }

        const imageBuffer = await generateMapGeneratorImageBuffer(decoded.map);

        return pngResponse(imageBuffer);
      },
    },
  },
});
