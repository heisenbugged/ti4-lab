import { buildInitialTexasDraft } from "~/draft/buildInitialDraft";
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
}: BuildTexasDraftInput): Draft {
  return buildInitialTexasDraft(settings, players, integrations);
}
