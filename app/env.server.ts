declare global {
  var env: Env;
}

type Env = {
  baseUrl: string;
  discordOauthUrl: string;
};

const localEnv = {
  baseUrl: "http://localhost:3000",
  discordOauthUrl:
    "https://discord.com/oauth2/authorize?client_id=1249387926559916132&permissions=2048&integration_type=0&scope=bot",
};

const prodEnv = {
  baseUrl: "https://tidraft.com",
  discordOauthUrl:
    "https://discord.com/oauth2/authorize?client_id=1247915595551477850&permissions=2048&integration_type=0&scope=bot",
};

export function initEnv() {
  global.env = process.env.NODE_ENV === "production" ? prodEnv : localEnv;
}
