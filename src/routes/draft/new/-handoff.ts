import type { DiscordData, Draft, DraftSettings, Player } from "~/types";

/**
 * What the setup pages hand to /draft/new through history state: either
 * settings to generate a draft from, or a saved draft (preset) to restore.
 */
export type NewDraftHandoff =
  | { draftSettings: DraftSettings; players: Player[]; discordData?: DiscordData }
  | { savedDraftState: Draft };

declare module "@tanstack/react-router" {
  interface HistoryState {
    newDraft?: NewDraftHandoff;
    /** Set when /draft/new bounced back because the settings couldn't build a draft. */
    invalidDraftParameters?: boolean;
  }
}
