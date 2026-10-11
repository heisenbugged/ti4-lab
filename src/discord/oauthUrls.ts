/** Bot invite links for the local and production Discord apps. */
export const DISCORD_OAUTH_URLS = {
  local:
    "https://discord.com/oauth2/authorize?client_id=1249387926559916132&permissions=2048&integration_type=0&scope=bot",
  production:
    "https://discord.com/oauth2/authorize?client_id=1247915595551477850&permissions=2048&integration_type=0&scope=bot",
};

/** The invite link for this build (safe to use in client code). */
export const discordOauthUrl = import.meta.env?.PROD
  ? DISCORD_OAUTH_URLS.production
  : DISCORD_OAUTH_URLS.local;
