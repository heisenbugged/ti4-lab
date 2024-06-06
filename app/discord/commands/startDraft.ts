import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

async function execute(interaction) {
  console.log("the full interaction is", interaction);
  await interaction.reply("Pong! BONKERS PONG");
}

export default {
  data,
  execute,
};
