import { ChatInputCommandInteraction } from "discord.js";
import { DiscordData, DiscordPlayer } from "~/types";
import { draftPresetByName } from "~/drizzle/draftPreset.server";
import {
  createDraftFromPreset,
  DraftPresetError,
  playersFromDiscordData,
} from "~/utils/draftFromPreset.server";
import { finalizeDraftPresetName } from "~/utils/draftPresetName";
import { notifyPick } from "../bot.server";
import { PLAYER_OPTIONS, startDraftCommand } from "./startDraftCommand";

const data = startDraftCommand;

async function resolveMember(
  interaction: ChatInputCommandInteraction,
  memberId: string,
) {
  const cached = interaction.guild?.members.cache.get(memberId);
  if (cached) return cached;
  try {
    return await interaction.guild?.members.fetch(memberId);
  } catch {
    return undefined;
  }
}

async function parsePlayers(
  interaction: ChatInputCommandInteraction,
): Promise<DiscordPlayer[]> {
  const names = PLAYER_OPTIONS.map((name) =>
    interaction.options.getString(name),
  ).filter((name): name is string => !!name);

  return Promise.all(
    names.map(async (name, idx): Promise<DiscordPlayer> => {
      const mentionMatch = name.match(/^<@!?(\d+)>$/);
      const member = mentionMatch
        ? await resolveMember(interaction, mentionMatch[1])
        : undefined;

      if (member) {
        return {
          type: "identified",
          playerId: idx,
          memberId: member.id,
          nickname: member.nickname ?? undefined,
          username: member.user.username,
        };
      }

      return {
        playerId: idx,
        type: "unidentified",
        name,
      };
    }),
  );
}

async function execute(interaction: ChatInputCommandInteraction) {
  const players = await parsePlayers(interaction);

  const discordData: DiscordData = {
    players,
    channelId: interaction.channelId!,
    guildId: interaction.guildId!,
  };

  const presetOption = interaction.options.getString("preset");
  if (presetOption) {
    await startDraftFromPreset(interaction, presetOption, discordData);
    return;
  }

  const discordString = btoa(JSON.stringify(discordData));
  const draftUrl = `${global.env.baseUrl}/draft/prechoice?discord=${discordString}`;

  await interaction.reply({
    content: `Draft link: [Click here to start the draft](${draftUrl})`,
    ephemeral: true,
  });
}

async function startDraftFromPreset(
  interaction: ChatInputCommandInteraction,
  presetOption: string,
  discordData: DiscordData,
) {
  await interaction.deferReply({ ephemeral: true });

  const presetName = finalizeDraftPresetName(presetOption);
  const preset = await draftPresetByName(presetName);
  if (!preset) {
    await interaction.editReply({
      content: `No draft preset named \`${presetName}\` was found.`,
    });
    return;
  }

  try {
    const { id, prettyUrl, draft } = await createDraftFromPreset(
      preset,
      playersFromDiscordData(discordData),
      discordData,
    );
    const draftUrl = `${global.env.baseUrl}/draft/${prettyUrl}`;

    await interaction.editReply({
      content: `Draft created from preset \`${preset.name}\`: ${draftUrl}`,
    });
    await notifyPick(id, prettyUrl, draft);
  } catch (error) {
    if (error instanceof DraftPresetError) {
      await interaction.editReply({ content: error.message });
      return;
    }
    throw error;
  }
}

export default {
  data,
  execute,
};
