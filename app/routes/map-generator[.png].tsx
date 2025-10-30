import { LoaderFunctionArgs } from "@remix-run/node";
import { generateMapGeneratorImageBuffer } from "~/skiaRendering/mapGeneratorImage.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const mapSystemIds = url.searchParams.get("mapSystemIds");
  const mapConfig = url.searchParams.get("mapConfig") || "milty6p";

  if (!mapSystemIds) {
    throw new Response("mapSystemIds parameter required", { status: 400 });
  }

  const systemIds = mapSystemIds.split(",").filter(Boolean);

  // Generate image buffer
  const imageBuffer = await generateMapGeneratorImageBuffer(
    systemIds,
    mapConfig,
  );

  // Return image directly
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
