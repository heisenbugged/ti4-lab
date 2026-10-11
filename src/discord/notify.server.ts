import {
  DiscordAPIError,
  GuildTextBasedChannel,
  RESTJSONErrorCodes,
} from "discord.js";
import { Draft, Player } from "~/types";
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

async function deleteTrackedMessage(
  draftId: string,
  messageType: number,
  channel: GuildTextBasedChannel,
) {
  const messageId = await getDiscordPickMessage(draftId, messageType);
  if (messageId) {
    try {
      await channel.messages.delete(messageId);
    } catch (error) {
      const isUnknownMessage =
        error instanceof DiscordAPIError &&
        error.code === RESTJSONErrorCodes.UnknownMessage;
      if (!isUnknownMessage) throw error;
    }
    await deleteDiscordPickMessage(draftId, messageType);
  }
}

async function sendTrackedMessage(
  draftId: string,
  messageType: number,
  channel: GuildTextBasedChannel,
  content: string,
): Promise<void> {
  await deleteTrackedMessage(draftId, messageType, channel);
  const sentMessage = await channel.send(content);
  await addDiscordPickMessage(draftId, messageType, sentMessage.id);
}

function resolveSelectionPlayer(
  players: Player[],
  selection: Draft["selections"][number] | undefined,
  pickOrderEntry: Draft["pickOrder"][number] | undefined,
): Player | undefined {
  if (!selection) return undefined;

  if ("playerId" in selection) {
    return players.find((player) => player.id === selection.playerId);
  }

  if (typeof pickOrderEntry === "number") {
    return players[pickOrderEntry];
  }

  return undefined;
}

function getPlayerMentionOrFallback(
  player: Player | undefined,
  draft: Draft,
): string {
  if (!player) return "A player";
  return getDiscordMention(player, draft.integrations.discord!);
}

async function announceLastPick(
  draftId: string,
  draft: Draft,
  channel: GuildTextBasedChannel,
): Promise<void> {
  if (draft.selections.length === 0) return;

  const { players, pickOrder, selections } = draft;
  const previousPick = selections[selections.length - 1];
  const previousPickIdx = selections.length - 1;
  const previousPickOrder = pickOrder[previousPickIdx];

  const previousPlayer = resolveSelectionPlayer(
    players,
    previousPick,
    previousPickOrder,
  );
  const previousPlayerName = getPlayerMentionOrFallback(previousPlayer, draft);

  const pickMessage = draftSelectionToMessage(
    previousPlayerName,
    previousPick,
    draft,
  );
  await sendTrackedMessage(
    draftId,
    MESSAGE_TYPE.LAST_PICK,
    channel,
    pickMessage,
  );
}

async function notifyNextPlayer(
  draftId: string,
  draftUrl: string,
  draft: Draft,
  channel: GuildTextBasedChannel,
): Promise<void> {
  const { players, pickOrder, selections, integrations } = draft;
  const currentPick = pickOrder[selections.length];
  if (typeof currentPick !== "number") return;

  const currentPlayer = players[currentPick];
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
    await sendTrackedMessage(
      draftId,
      MESSAGE_TYPE.SUMMARY,
      context.channel,
      summaryMessage,
    );

    await announceLastPick(draftId, draft, context.channel);
    await notifyNextPlayer(draftId, draftUrl, draft, context.channel);

    return { success: true };
  } catch (error) {
    return { success: false, ...classifyDiscordError(error) };
  }
}
