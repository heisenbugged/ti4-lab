import {
  generateReferenceCardPacks,
  getDraftableFactions,
  randomizeFactions,
} from "~/draftStore";
import { createDraft } from "~/drizzle/draft.server";
import { DraftPreset } from "~/drizzle/draftPreset.server";
import { shuffle } from "~/draft/helpers/randomization";
import { DiscordData, Draft, FactionId, Player } from "~/types";
import { getFactionPool } from "~/utils/factions";
import { createDraftOrder } from "~/utils/draftOrder.server";

export class DraftPresetError extends Error {}

/**
 * Re-rolls the faction related parts of a preset while respecting the
 * preset's faction pool settings (game sets, allowed/required factions,
 * stratification, minor factions, kings & reference card packs).
 */
function rerollFactions(
  preset: DraftPreset,
  playerCount: number,
): Pick<
  Draft,
  "availableFactions" | "availableMinorFactions" | "availableReferenceCardPacks"
> {
  const { settings } = preset.data;
  const factionPool = getFactionPool(settings.factionGameSets);

  if (settings.draftGameMode === "twilightsFall") {
    const numKings = settings.numKings ?? 8;
    return {
      availableFactions: shuffle([...factionPool], numKings),
      availableReferenceCardPacks: generateReferenceCardPacks(
        settings.numReferenceCardPacks ?? playerCount,
      ),
    };
  }

  const availableFactions = randomizeFactions(
    settings.numFactions,
    getDraftableFactions(factionPool, null, settings.allowedFactions),
    settings.requiredFactions,
    settings.factionStratification,
  );

  let availableMinorFactions: FactionId[] | undefined = undefined;
  if (settings.numMinorFactions) {
    availableMinorFactions = shuffle(
      getDraftableFactions(factionPool, availableFactions),
      settings.numMinorFactions,
    );
  }

  return { availableFactions, availableMinorFactions };
}

export function playersFromDiscordData(discordData: DiscordData): Player[] {
  return discordData.players.map((discordPlayer) => ({
    id: discordPlayer.playerId,
    name: discordPlayer.type === "unidentified" ? discordPlayer.name : "",
  }));
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
  const { settings, slices, presetMap } = preset.data;

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

  const factionState = preset.keepFactions
    ? {
        availableFactions: preset.data.availableFactions,
        availableMinorFactions: preset.data.availableMinorFactions,
        availableReferenceCardPacks: preset.data.availableReferenceCardPacks,
      }
    : rerollFactions(preset, players.length);

  const draft: Draft = {
    settings,
    integrations: { discord: discordData },
    slices,
    presetMap,
    ...factionState,
    ...createDraftOrder({
      players,
      settings,
      availableFactions: factionState.availableFactions,
      presetMap,
    }),
  };

  const { id, prettyUrl } = await createDraft(draft);
  return { id, prettyUrl, draft };
}
