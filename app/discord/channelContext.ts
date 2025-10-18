import { TextChannel } from "discord.js";
import { Draft } from "~/types";
import { getChannel } from "./bot.server";

export type ChannelContext = {
  channel: TextChannel;
  draftId: string;
  draft: Draft;
};

export async function createChannelContext(
  draftId: string,
  draft: Draft,
): Promise<ChannelContext> {
  if (!draft.integrations.discord) {
    throw new Error("Draft does not have Discord integration");
  }

  const { guildId, channelId } = draft.integrations.discord;
  const channel = await getChannel(guildId, channelId);

  return {
    channel,
    draftId,
    draft,
  };
}
