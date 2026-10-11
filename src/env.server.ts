import { DISCORD_OAUTH_URLS } from "./discord/oauthUrls";

declare global {
  var env: Env;
}

type Env = {
  baseUrl: string;
  discordOauthUrl: string;
};

const localEnv = {
  baseUrl: "http://localhost:3000",
  discordOauthUrl: DISCORD_OAUTH_URLS.local,
};

const prodEnv = {
  baseUrl: "https://tidraft.com",
  discordOauthUrl: DISCORD_OAUTH_URLS.production,
};

export function initEnv() {
  global.env = process.env.NODE_ENV === "production" ? prodEnv : localEnv;
}
