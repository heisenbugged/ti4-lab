import { createFileRoute } from "@tanstack/react-router";
import { redirectToImage } from "~/utils/imageResponse.server";
import {
  presetMapById,
  updatePresetMapImageUrl,
} from "~/drizzle/presetMap.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { generateMapGeneratorImageBuffer } from "~/skiaRendering/mapGeneratorImage.server";
import { syncPresetMapImageToR2 } from "~/utils/syncImageToR2.server";

export const Route = createFileRoute("/map-preset/{$id}.png")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!id) {
          return new Response("Map ID required", { status: 400 });
        }

        const preset = await presetMapById(id);
        if (!preset) {
          return new Response("Preset map not found", { status: 404 });
        }

        if (preset.imageUrl) {
          return redirectToImage(preset.imageUrl);
        }

        const decoded = decodeMapString(preset.mapString);
        if (!decoded) {
          return new Response("Invalid map string format", { status: 400 });
        }

        const imageBuffer = await generateMapGeneratorImageBuffer(decoded.map);
        const cdnUrl = await syncPresetMapImageToR2(preset.id, imageBuffer);
        await updatePresetMapImageUrl(preset.id, cdnUrl);

        return redirectToImage(cdnUrl);
      },
    },
  },
});
