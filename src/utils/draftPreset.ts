import type { Draft } from "~/types";

const DRAFT_PRESET_KEYS = [
  "settings",
  "slices",
  "presetMap",
  "availableFactions",
  "availableMinorFactions",
  "availableReferenceCardPacks",
] as const;

/** The subset of a draft that is persisted in a preset. */
export type DraftPresetData = Pick<Draft, (typeof DRAFT_PRESET_KEYS)[number]>;

export function draftToPresetData(draft: DraftPresetData): DraftPresetData {
  return Object.fromEntries(
    DRAFT_PRESET_KEYS.map((key) => [key, draft[key]]),
  ) as DraftPresetData;
}

/** Error message when a preset is started with the wrong number of players. */
export function presetPlayerCountError(
  preset: { name: string; playerCount: number },
  playerCount: number,
): string | undefined {
  if (playerCount === preset.playerCount) return undefined;
  return `Preset "${preset.name}" was saved for ${preset.playerCount} players, but ${playerCount} were provided.`;
}
