import { LoaderFunctionArgs } from "react-router";
import { presetMapById } from "~/drizzle/presetMap.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { generateMapGeneratorImageBuffer } from "~/skiaRendering/mapGeneratorImage.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = params.id;
  if (!id) {
    throw new Response("Map ID required", { status: 400 });
  }

  const preset = await presetMapById(id);
  if (!preset) {
    throw new Response("Preset map not found", { status: 404 });
  }

  const decoded = decodeMapString(preset.mapString);
  if (!decoded) {
    throw new Response("Invalid map string format", { status: 400 });
  }

  const imageBuffer = await generateMapGeneratorImageBuffer(
    decoded.map,
    decoded.closedTiles,
  );

  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
