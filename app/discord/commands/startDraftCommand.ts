import { SlashCommandBuilder } from "discord.js";

/**
 * Slash command definition for /labdraft. Kept free of server/database
 * imports so `deployCommands.ts` can register it without booting the app.
 */
export const PLAYER_OPTIONS = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
] as const;

export const startDraftCommand = new SlashCommandBuilder()
  .setName("labdraft")
  .setDescription(
    "Will provide a TI4 link. Once  created, notifications will be sent to this channel.",
  );

PLAYER_OPTIONS.forEach((name, idx) => {
  startDraftCommand.addStringOption((option) =>
    option
      .setName(name)
      .setDescription(`Player ${idx + 1}'s discord name`)
      .setRequired(idx < 4),
  );
});

startDraftCommand.addStringOption((option) =>
  option
    .setName("preset")
    .setDescription(
      "Name of a saved draft preset. Immediately starts a draft from it in this channel.",
    )
    .setRequired(false),
);
