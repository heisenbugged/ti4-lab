import { draftConfig } from "~/draft/draftConfig";
import { generateEmptyMap } from "~/utils/map";
import { getFactionPool } from "~/utils/factions";
import { getSystemPool } from "~/utils/system";
import { getDraftableFactions } from "~/draftStore";
import {
  createTexasSeatAssignments,
  dealTexasTiles,
} from "~/draft/texas/texasDraft";
import type { Draft, DraftSettings, Player, DraftIntegrations } from "~/types";

type BuildTexasDraftInput = {
  settings: DraftSettings;
  players: Player[];
  integrations: DraftIntegrations;
};

/**
 * Build a complete Texas style draft object ready for submission to the server.
 * This allows prechoice to submit directly to the action without going through
 * the /draft/new page.
 */
export function buildTexasDraft({
  settings,
  players,
  integrations,
}: BuildTexasDraftInput): Omit<Draft, "pickOrder"> {
  const config = draftConfig[settings.type];

  // Initialize pools
  const factionPool = getFactionPool(settings.factionGameSets);
  const systemPool = getSystemPool(settings.tileGameSets);

  // Get draftable factions
  const draftableFactions = getDraftableFactions(
    factionPool,
    null,
    settings.allowedFactions ?? null,
  );

  // Create texasDraft state with seat assignments and tile hands
  // Faction hands are NOT dealt here because there's a ban phase first
  const texasDraft = {
    ...createTexasSeatAssignments(players),
    ...dealTexasTiles(systemPool, players),
  };

  // Generate empty map for the selected map type
  const presetMap = generateEmptyMap(config);

  return {
    settings,
    players,
    integrations,
    availableFactions: draftableFactions,
    slices: [],
    presetMap,
    selections: [],
    texasDraft,
  };
}
