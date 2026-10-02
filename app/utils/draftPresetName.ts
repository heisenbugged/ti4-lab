export const DRAFT_PRESET_NAME_MAX_LENGTH = 64;

/**
 * Normalizes a user-typed preset name into a hyphenated slug:
 * lowercase, alphanumerics and single hyphens only, no leading/trailing hyphens.
 */
export function sanitizeDraftPresetName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, DRAFT_PRESET_NAME_MAX_LENGTH);
}

/**
 * Final form of a name: also strips trailing hyphens left while typing.
 * An empty result means the name is invalid.
 */
export function finalizeDraftPresetName(raw: string): string {
  return sanitizeDraftPresetName(raw).replace(/-+$/, "");
}
