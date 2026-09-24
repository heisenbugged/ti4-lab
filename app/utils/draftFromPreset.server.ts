import { rollFactions } from "~/draftStore";
import { createDraft } from "~/drizzle/draft.server";
import { DraftPreset, DraftPresetData } from "~/drizzle/draftPreset.server";
import { DiscordData, Draft, Player } from "~/types";
import { getFactionPool } from "~/utils/factions";
import { createDraftOrder } from "~/utils/draftOrder.server";

export class DraftPresetError extends Error {}

/** Returns the preset's data, with factions re-rolled unless `keepFactions`. */
export function draftPresetDataForNewDraft(
  preset: DraftPreset,
): DraftPresetData {
  if (preset.keepFactions) return preset.data;

  const { settings } = preset.data;
  return {
    ...preset.data,
    ...rollFactions(
      settings,
      getFactionPool(settings.factionGameSets),
      preset.playerCount,
    ),
  };
}

/**
 * Creates and persists a brand new draft from a saved preset. Player order
 * (pick order) is always re-randomized; factions are re-rolled unless the
 * preset was saved with `keepFactions`.
 */
export async function createDraftFromPreset(
  preset: DraftPreset,
  players: Player[],
  discordData?: DiscordData,
) {
  const {
    settings,
    slices,
    presetMap,
    availableFactions,
    availableMinorFactions,
    availableReferenceCardPacks,
  } = draftPresetDataForNewDraft(preset);

  if (settings.draftGameMode === "texasStyle") {
    throw new DraftPresetError(
      "Texas style drafts cannot be started from a preset.",
    );
  }

  if (players.length !== preset.playerCount) {
    throw new DraftPresetError(
      `Preset "${preset.name}" was saved for ${preset.playerCount} players, but ${players.length} were provided.`,
    );
  }

  const draft: Draft = {
    settings,
    integrations: { discord: discordData },
    slices,
    presetMap,
    availableFactions,
    availableMinorFactions,
    availableReferenceCardPacks,
    ...createDraftOrder({
      players,
      settings,
      availableFactions,
      presetMap,
    }),
  };

  const { id, prettyUrl } = await createDraft(draft);
  return { id, prettyUrl, draft };
}
