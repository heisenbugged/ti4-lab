import { createFileRoute } from "@tanstack/react-router";
import { exchangeCode, redirectTo } from "~/auth/discord.server";
import { userSession } from "~/auth/session.server";
import { upsertUserWithHub } from "~/drizzle/hub.server";

// Discord's OAuth redirect lands here.
export const Route = createFileRoute("/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const session = await userSession();
        const { oauthState, returnTo } = session.data;

        // Cancelled on Discord, or a forged/stale callback.
        if (!code || !state || state !== oauthState) {
          await session.update({ oauthState: undefined, returnTo: undefined });
          return redirectTo(`/hub?signin=failed`);
        }

        try {
          const discordUser = await exchangeCode(request, code);
          const hub = await upsertUserWithHub(discordUser);
          // Fresh session on sign-in: drop the login scratch state.
          await session.clear();
          await session.update({ userId: discordUser.id });
          return redirectTo(returnTo ?? `/hub/${hub.slug}`);
        } catch (error) {
          console.error("Discord sign-in failed", error);
          await session.update({ oauthState: undefined, returnTo: undefined });
          return redirectTo(`/hub?signin=failed`);
        }
      },
    },
  },
});
