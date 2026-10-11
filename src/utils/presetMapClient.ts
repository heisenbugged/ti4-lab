/** Links and requests for preset maps shared by the listing, detail page and generator. */

import { likePreset } from "~/server/presetMaps.functions";

export function presetImageUrl(
  preset: { id: string; imageUrl: string | null },
  origin = "",
): string {
  return preset.imageUrl ?? `${origin}/map-preset/${preset.id}.png`;
}

export function mapGeneratorHref(mapString: string, origin = ""): string {
  return `${origin}/map-generator?map=${encodeURIComponent(mapString)}`;
}

/** Likes a map (once per visitor); returns the new like total, or null on failure. */
export async function postPresetMapLike(id: string): Promise<number | null> {
  return likePreset({ data: id }).catch(() => null);
}
