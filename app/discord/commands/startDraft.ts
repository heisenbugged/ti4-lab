import {
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordData } from "~/types";

const data = new SlashCommandBuilder()
  .setName("startdraft")
  .setDescription(
    "Will provide a TI4 link. Once  created, notifications will be sent to this channel.",
  )
  .addStringOption((option) =>
    option
      .setName("player1")
      .setDescription("Player 1's discord name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("player2")
      .setDescription("Player 2's discord name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("player3")
      .setDescription("Player 3's discord name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("player4")
      .setDescription("Player 4's discord name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("player5")
      .setDescription("Player 5's discord name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("player6")
      .setDescription("Player 6's discord name")
      .setRequired(true),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const data = interaction.options.data;
  const players = [
    data.find((option) => option.name === "player1")?.value as string,
    data.find((option) => option.name === "player2")?.value as string,
    data.find((option) => option.name === "player3")?.value as string,
    data.find((option) => option.name === "player4")?.value as string,
    data.find((option) => option.name === "player5")?.value as string,
    data.find((option) => option.name === "player6")?.value as string,
  ].map((name) => {
    if (name.startsWith("<@")) {
      const memberId = name.substring(2, name.length - 1);
      return {
        name: interaction.guild?.members.cache.get(memberId)?.nickname!,
        memberId,
      };
    }
    return { name, memberId: undefined };
  });

  const discordData: DiscordData = {
    players,
    channelId: interaction.channelId!,
    guildId: interaction.guildId!,
  };

  const discordString = btoa(JSON.stringify(discordData));

  await interaction.reply({
    content: `Draft link: ${global.env.baseUrl}/draft/prechoice?discord=${discordString}`,
    ephemeral: true,
  });
}

export default {
  data,
  execute,
};
