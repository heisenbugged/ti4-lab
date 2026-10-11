import {
  getTakenNonPrimaryFactions,
  rollFactions,
} from "~/draft/buildInitialDraft";
import { createDraft } from "~/drizzle/draft.server";
import { DraftPreset } from "~/drizzle/draftPreset.server";
import { DiscordData, Draft, Player } from "~/types";
import { DraftPresetData, presetPlayerCountError } from "~/utils/draftPreset";
import { getFactionPool } from "~/utils/factions";
import { withDraftOrder } from "~/utils/draftOrder.server";

export class DraftPresetError extends Error {}

/**
 * Returns the preset's data, with factions re-rolled unless `keepFactions`.
 * Re-rolled factions never include factions whose systems are already on the
 * saved map or slices.
 */
export function draftPresetDataForNewDraft(
  preset: DraftPreset,
): DraftPresetData {
  if (preset.keepFactions) return preset.data;

  const { settings, presetMap, slices } = preset.data;
  return {
    ...preset.data,
    ...rollFactions(
      settings,
      getFactionPool(settings.factionGameSets),
      preset.playerCount,
      getTakenNonPrimaryFactions({ presetMap, slices }),
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
  const playerCountError = presetPlayerCountError(preset, players.length);
  if (playerCountError) throw new DraftPresetError(playerCountError);

  const draft: Draft = withDraftOrder({
    ...draftPresetDataForNewDraft(preset),
    integrations: { discord: discordData },
    players,
  });

  const { id, prettyUrl } = await createDraft(draft);
  return { id, prettyUrl, draft };
}
