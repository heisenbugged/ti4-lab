import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { createPresetMap, listPresetMaps } from "~/drizzle/presetMap.server";
import {
  browseMaps,
  parseBrowseFilters,
  PRESET_PAGE_SIZE,
} from "~/utils/presetDiscovery";

/**
 * GET /api/preset-maps?offset=24&sort=played&players=6&author=… — one page of
 * the community listing, filtered and grouped exactly like the page itself.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const items = browseMaps(await listPresetMaps(), parseBrowseFilters(params));
  return {
    items: items.slice(offset, offset + PRESET_PAGE_SIZE),
    hasMore: offset + PRESET_PAGE_SIZE < items.length,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data(
      { success: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    author?: string;
    mapString?: string;
    mapConfigId?: string;
  };

  const name = body.name?.trim();
  const description = body.description?.trim();
  const author = body.author?.trim();
  const mapString = body.mapString?.trim();
  const mapConfigId = body.mapConfigId?.trim();

  if (!name || !description || !author || !mapString || !mapConfigId) {
    return data(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  const preset = await createPresetMap({
    name,
    description,
    author,
    mapString,
    mapConfigId,
  });

  return data({ success: true, id: preset.id, slug: preset.slug });
}
