import dotenv from "dotenv";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import startDraft from "./commands/startDraft";
import { DiscordData, Draft, DraftSelection, Player } from "~/types";
import {
  getDiscordPickMessage,
  addDiscordPickMessage,
} from "~/drizzle/discordMessages.server";
import { factions } from "~/data/factionData";

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

export async function notifyPick(
  draftId: string,
  draftUrl: string,
  draft: Draft,
) {
  if (!draft.integrations.discord) return;
  if (draft.selections.length === draft.pickOrder.length) return;

  const {
    integrations: { discord },
    players,
    pickOrder,
    selections,
  } = draft;

  // Edit existing message to reflect the pick.
  const previousMessageId = await getDiscordPickMessage(
    draftId,
    draft.selections.length - 1,
  );
  if (previousMessageId) {
    const previousPlayerName = playerName(
      players[pickOrder[draft.selections.length - 1]],
      discord,
    );
    const previousPick = draft.selections[draft.selections.length - 1];

    console.log("Editing previous message to reflect the pick made");
    await editMessage(
      draft,
      previousMessageId,
      draftSelectionToMessage(previousPlayerName, previousPick),
    );
  }

  // Add new message prompting the next player to make a pick.
  const currentPlayer = players[pickOrder[selections.length]];
  const channel = await getChannel(discord.guildId, discord.channelId);

  const discordPlayer = discord.players.find(
    (p) => p.playerId === currentPlayer.id,
  );
  const discordMemberId =
    discordPlayer?.type === "identified" ? discordPlayer.memberId : undefined;

  const message = discordMemberId
    ? `It's your turn to draft, <@${discordMemberId}>! [Draft link](${global.env.baseUrl}/draft/${draftUrl})`
    : `It's your turn to draft, ${currentPlayer.name}! [Draft link](${global.env.baseUrl}/draft/${draftUrl})`;

  const sentMessage = await channel?.send(message);
  await addDiscordPickMessage(draftId, draft.selections.length, sentMessage.id);
}

const playerName = (player: Player, discordData: DiscordData) => {
  const discordPlayer = discordData.players.find(
    (p) => p.playerId === player.id,
  );
  const discordMemberId =
    discordPlayer?.type === "identified" ? discordPlayer.memberId : undefined;

  return discordMemberId ? `<@${discordMemberId}>` : player.name;
};

export async function editMessage(
  draft: Draft,
  messageId: string,
  newContent: string,
) {
  if (!draft.integrations.discord) return;

  const discord = draft.integrations.discord;
  const channel = await getChannel(discord.guildId, discord.channelId);

  try {
    const message = await channel.messages.fetch(messageId);
    await message.edit(newContent);
    console.log(`Message ${messageId} successfully edited.`);
  } catch (error) {
    console.error(`Error editing message ${messageId}:`, error);
  }
}

function draftSelectionToMessage(
  playerName: string,
  selection: DraftSelection,
) {
  if (selection.type === "SELECT_SPEAKER_ORDER") {
    return `${playerName} selected speaker order: ${selection.speakerOrder + 1}`;
  }
  if (selection.type === "SELECT_SLICE") {
    return `${playerName} selected slice: ${selection.sliceIdx + 1}`;
  }
  if (selection.type === "SELECT_FACTION") {
    const faction = factions[selection.factionId];
    return `${playerName} selected faction: ${faction.name}`;
  }
  if (selection.type === "SELECT_MINOR_FACTION") {
    const minorFaction = factions[selection.minorFactionId];
    return `${playerName} selected minor faction: ${minorFaction.name}`;
  }
  if (selection.type === "SELECT_SEAT") {
    return `${playerName} selected seat: ${selection.seatIdx + 1}`;
  }
  if (selection.type === "SELECT_PLAYER_COLOR") {
    return `${playerName} selected color: ${selection.color}`;
  }

  return "";
}
