import { randomBytes } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import {
  authorizeUrl,
  DEV_USER,
  discordClientId,
  safeReturnTo,
  devSignInEnabled,
  redirectTo,
} from "~/auth/discord.server";
import { sessionsEnabled, userSession } from "~/auth/session.server";
import { upsertUserWithHub } from "~/drizzle/hub.server";

// "Sign in with Discord" starts here: /auth/discord?returnTo=/draft/new
export const Route = createFileRoute("/auth/discord/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
        const configured =
          sessionsEnabled() &&
          (devSignInEnabled() || (discordClientId() && process.env.DISCORD_CLIENT_SECRET));
        if (!configured) {
          return new Response("Discord sign-in isn't configured.", { status: 503 });
        }
        const session = await userSession();

        if (devSignInEnabled()) {
          const hub = await upsertUserWithHub(DEV_USER);
          await session.update({ userId: DEV_USER.id });
          return redirectTo(returnTo ?? `/hub/${hub.slug}`);
        }

        const state = randomBytes(16).toString("hex");
        await session.update({ oauthState: state, returnTo });
        return redirectTo(authorizeUrl(request, state));
      },
    },
  },
});
