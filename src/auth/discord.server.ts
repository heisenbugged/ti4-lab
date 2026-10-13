// Discord OAuth2 (authorization code, `identify` scope only).

const DISCORD_API = "https://discord.com/api/v10";

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export function discordClientId() {
  return process.env.DISCORD_CLIENT_ID;
}

/**
 * Without a client secret in local dev, sign-in skips Discord and uses a
 * stand-in account so the hub can be worked on offline.
 */
export function devSignInEnabled() {
  return (
    !process.env.DISCORD_CLIENT_SECRET && process.env.NODE_ENV !== "production"
  );
}

export const DEV_USER: DiscordUser = {
  id: "dev-local-tester",
  username: "local-tester",
  global_name: "Local tester",
  avatar: null,
};

export function redirectUri(request: Request) {
  return (
    process.env.DISCORD_OAUTH_REDIRECT_URI ??
    new URL("/auth/discord/callback", request.url).toString()
  );
}

export function authorizeUrl(request: Request, state: string) {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", discordClientId()!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri(request));
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "none");
  return url.toString();
}

export async function exchangeCode(
  request: Request,
  code: string,
): Promise<DiscordUser> {
  const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: discordClientId()!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(request),
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Discord token exchange failed (${tokenResponse.status})`);
  }
  const { access_token } = (await tokenResponse.json()) as {
    access_token: string;
  };

  const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userResponse.ok) {
    throw new Error(`Discord user lookup failed (${userResponse.status})`);
  }
  return (await userResponse.json()) as DiscordUser;
}

export function avatarUrl(user: { id: string; avatar: string | null }) {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=96`;
}

export function redirectTo(location: string) {
  return new Response(null, { status: 302, headers: { Location: location } });
}

/** Only same-site paths, so the login can't bounce people elsewhere. */
export function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}
