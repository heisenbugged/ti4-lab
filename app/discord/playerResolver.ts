import { DiscordData, Player } from "~/types";

export function getDiscordMemberId(
  player: Player,
  discordData: DiscordData,
): string | undefined {
  const discordPlayer = discordData.players.find(
    (p) => p.playerId === player.id,
  );
  return discordPlayer?.type === "identified"
    ? discordPlayer.memberId
    : undefined;
}

export function getDiscordMention(
  player: Player,
  discordData: DiscordData,
): string {
  const memberId = getDiscordMemberId(player, discordData);
  return memberId ? `<@${memberId}>` : player.name;
}
