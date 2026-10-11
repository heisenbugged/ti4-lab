import { DiscordData, Player } from "~/types";

export function playersFromDiscordData(discordData: DiscordData): Player[] {
  return discordData.players.map((discordPlayer) => ({
    id: discordPlayer.playerId,
    name: discordPlayer.type === "unidentified" ? discordPlayer.name : "",
  }));
}
