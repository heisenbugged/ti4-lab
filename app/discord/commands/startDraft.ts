import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordData, DiscordPlayer } from "~/types";

const data = new SlashCommandBuilder()
  .setName("labdraft")
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
  ].map((name, idx) => {
    if (name.startsWith("<@")) {
      const memberId = name.substring(2, name.length - 1);
      const member = interaction.guild?.members.cache.get(memberId)!;
      const nickname = member.nickname;
      const username = member.user.username;

      const discordPlayer: DiscordPlayer = {
        type: "identified",
        playerId: idx,
        memberId,
        nickname: nickname ?? undefined,
        username,
      };
      return discordPlayer;
    }

    const discordPlayer: DiscordPlayer = {
      playerId: idx,
      type: "unidentified",
      name,
    };
    return discordPlayer;
  });

  const discordData: DiscordData = {
    players,
    channelId: interaction.channelId!,
    guildId: interaction.guildId!,
    pickMessageIds: {},
  };

  const discordString = btoa(JSON.stringify(discordData));
  const draftUrl = `${global.env.baseUrl}/draft/prechoice?discord=${discordString}`;

  await interaction.reply({
    content: `Draft link: [Click here to start the draft](${draftUrl})`,
    ephemeral: true,
  });
}

export default {
  data,
  execute,
};
