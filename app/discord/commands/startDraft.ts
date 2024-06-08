import {
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")
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
  const playerNames = [
    data.find((option) => option.name === "player1")?.value,
    data.find((option) => option.name === "player2")?.value,
    data.find((option) => option.name === "player3")?.value,
    data.find((option) => option.name === "player4")?.value,
    data.find((option) => option.name === "player5")?.value,
    data.find((option) => option.name === "player6")?.value,
  ];
  const discordString = btoa(
    JSON.stringify({
      playerNames,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
    }),
  );

  await interaction.reply({
    content: `Draft link: http://localhost:3000/draft/prechoice?discord=${discordString}`,
    ephemeral: true,
  });
}

export default {
  data,
  execute,
};
