import dotenv from "dotenv";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import startDraft from "./commands/startDraft";
import { Draft, PersistedDraft } from "~/types";

const commands = [startDraft];

declare global {
  var discordClient: Client;
}
export async function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });
  dotenv.config();
  const token = process.env.DISCORD_TOKEN;
  client.commands = new Collection();
  commands.forEach((command) => {
    client.commands.set(command.data.name, command);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    global.discordClient = readyClient;
  });

  // Log in to Discord with your client's token
  client.login(token);
}

export async function getChannel(guildId: string, channelId: string) {
  const cachedGuild = global.discordClient.guilds.cache.get(guildId);
  const guild =
    cachedGuild ?? (await global.discordClient.guilds.fetch(guildId));

  const cachedChannel = guild.channels.cache.get(channelId);
  return (cachedChannel ?? guild.channels.fetch(channelId)) as TextChannel;
}

export async function notifyCurrentPick(draft: Draft) {
  if (!draft.integrations.discord) return;
  if (draft.selections.length === draft.pickOrder.length) return;

  const discord = draft.integrations.discord;
  const currentPlayer = draft.players[draft.pickOrder[draft.selections.length]];
  const channel = await getChannel(discord.guildId, discord.channelId);
  const discordPlayer = discord.players.find(
    (p) => p.playerId === currentPlayer.id,
  );
  const discordMemberId =
    discordPlayer?.type === "identified" ? discordPlayer.memberId : undefined;

  if (discordMemberId) {
    channel?.send(`It's your turn to draft, <@${discordMemberId}>!`);
  } else {
    channel?.send(`It's your turn to draft, ${currentPlayer.name}!`);
  }
}
