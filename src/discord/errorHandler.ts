export type DiscordErrorResponse = {
  error: string;
  message: string;
};

export function classifyDiscordError(error: any): DiscordErrorResponse {
  console.error("Discord notification error:", error);

  // Permission errors
  if (
    error?.code === 50013 ||
    error?.message?.includes("Missing Permissions")
  ) {
    return {
      error: "MISSING_PERMISSIONS",
      message:
        "The bot doesn't have permission to post in this Discord channel. Please ensure the bot has 'Send Messages', 'View Channel', and 'Manage Messages' permissions in the channel.",
    };
  }

  // Access errors (private channels, DMs)
  if (error?.code === 50001 || error?.message?.includes("Missing Access")) {
    return {
      error: "MISSING_ACCESS",
      message:
        "The bot cannot access this Discord channel. This often happens when the command is used in a private/DM channel. Please use the command in a server channel where the bot is a member.",
    };
  }

  // Generic error
  return {
    error: "DISCORD_ERROR",
    message: `Discord notification failed: ${error?.message || "Unknown error"}`,
  };
}
