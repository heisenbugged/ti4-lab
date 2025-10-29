import dotenv from "dotenv";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import startDraft from "./commands/startDraft";
import { Draft } from "~/types";
import { createChannelContext } from "./channelContext";
import { classifyDiscordError } from "./errorHandler";
import { getDraftSummaryMessage } from "./formatters/draftSummary";
import { MESSAGE_TYPE } from "./constants/messageTypes";
import { getDiscordMention } from "./playerResolver";
import { draftSelectionToMessage } from "~/utils/selections";
import {
  getDiscordPickMessage,
  addDiscordPickMessage,
  deleteDiscordPickMessage,
} from "~/drizzle/discordMessages.server";

const commands = [startDraft];

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, typeof startDraft>;
  }
}

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

async function deleteTrackedMessage(
  draftId: string,
  messageType: number,
  channel: TextChannel,
) {
  const messageId = await getDiscordPickMessage(draftId, messageType);
  if (messageId) {
    await channel.messages.delete(messageId);
    await deleteDiscordPickMessage(draftId, messageType);
  }
}

async function replaceMessage(
  draftId: string,
  messageType: number,
  channel: TextChannel,
  content: string,
): Promise<void> {
  await deleteTrackedMessage(draftId, messageType, channel);
  const sentMessage = await channel.send(content);
  await addDiscordPickMessage(draftId, messageType, sentMessage.id);
}

async function sendTrackedMessage(
  draftId: string,
  messageType: number,
  channel: TextChannel,
  content: string,
): Promise<void> {
  await deleteTrackedMessage(draftId, messageType, channel);
  const sentMessage = await channel.send(content);
  await addDiscordPickMessage(draftId, messageType, sentMessage.id);
}

async function announceLastPick(
  draftId: string,
  draft: Draft,
  channel: TextChannel,
): Promise<void> {
  if (draft.selections.length === 0) return;

  const { players, pickOrder, selections, integrations } = draft;
  const previousPlayer = players[pickOrder[selections.length - 1]];
  const previousPlayerName = getDiscordMention(previousPlayer, integrations.discord!);
  const previousPick = selections[selections.length - 1];

  const pickMessage = draftSelectionToMessage(previousPlayerName, previousPick, draft);
  await sendTrackedMessage(draftId, MESSAGE_TYPE.LAST_PICK, channel, pickMessage);
}

async function notifyNextPlayer(
  draftId: string,
  draftUrl: string,
  draft: Draft,
  channel: TextChannel,
): Promise<void> {
  const { players, pickOrder, selections, integrations } = draft;
  const currentPlayer = players[pickOrder[selections.length]];
  const mention = getDiscordMention(currentPlayer, integrations.discord!);
  const draftLink = `[Draft link](${global.env.baseUrl}/draft/${draftUrl})`;

  const message = `It's your turn to draft, ${mention}! ${draftLink}`;
  await sendTrackedMessage(draftId, MESSAGE_TYPE.NEXT_PLAYER, channel, message);
}

export async function notifyPick(
  draftId: string,
  draftUrl: string,
  draft: Draft,
) {
  if (!draft.integrations.discord) return { success: true };
  if (draft.selections.length === draft.pickOrder.length)
    return { success: true };

  try {
    const context = await createChannelContext(draftId, draft);
    const summaryMessage = getDraftSummaryMessage(draft);
    await replaceMessage(
      draftId,
      MESSAGE_TYPE.SUMMARY,
      context.channel,
      summaryMessage,
    );

    await announceLastPick(draftId, draft, context.channel);
    await notifyNextPlayer(draftId, draftUrl, draft, context.channel);

    return { success: true };
  } catch (error: any) {
    return { success: false, ...classifyDiscordError(error) };
  }
}
