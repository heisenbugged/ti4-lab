import { LoaderFunctionArgs } from "react-router";
import { generateMapGeneratorImageBuffer } from "~/skiaRendering/mapGeneratorImage.server";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const mapParam = url.searchParams.get("map");

  if (!mapParam) {
    throw new Response("map parameter required", { status: 400 });
  }

  const decoded = decodeMapString(mapParam);
  if (!decoded) {
    throw new Response("Invalid map string format", { status: 400 });
  }

  // Generate image buffer
  const imageBuffer = await generateMapGeneratorImageBuffer(
    decoded.map,
    decoded.closedTiles,
  );

  // Return image directly
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
