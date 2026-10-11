import { GuildTextBasedChannel } from "discord.js";
import { Draft } from "~/types";

export type ChannelContext = {
  channel: GuildTextBasedChannel;
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

async function getChannel(guildId: string, channelId: string) {
  const client = global.discordClient;
  if (!client) {
    throw new Error("Discord client is not ready");
  }

  const guild =
    client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId));

  const channel =
    guild.channels.cache.get(channelId) ??
    (await guild.channels.fetch(channelId));
  if (!channel?.isTextBased()) {
    throw new Error(`Discord channel ${channelId} is not a text channel`);
  }
  return channel;
}
