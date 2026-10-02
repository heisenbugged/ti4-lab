/** Links and requests for preset maps shared by the listing, detail page and generator. */

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
  const response = await fetch(`/api/preset-maps/${id}/like`, {
    method: "POST",
  });
  const result = await response.json().catch(() => null);
  return result?.success ? result.likes : null;
}
