import { createFileRoute } from "@tanstack/react-router";
import { spotifyApi } from "~/vendors/spotifyApi";

// Spotify's OAuth redirect lands here.
export const Route = createFileRoute("/voices/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const voices = new URL("/voices", request.url);

        if (!code) {
          return new Response(null, {
            status: 302,
            headers: { Location: voices.toString() },
          });
        }

        const redirectUrl = new URL(process.env.SPOTIFY_OAUTH_REDIRECT_URI!);
        const { accessToken, refreshToken, expiresIn } =
          await spotifyApi.exchangeCodeForToken(
            code,
            redirectUrl.toString(),
            process.env.SPOTIFY_OAUTH_CLIENT_ID!,
            process.env.SPOTIFY_OAUTH_CLIENT_SECRET!,
          );

        const headers = new Headers({ Location: voices.toString() });
        headers.append(
          "Set-Cookie",
          `spotifyAccessToken=${accessToken}; Path=/; Max-Age=${expiresIn}; SameSite=Lax`,
        );
        headers.append(
          "Set-Cookie",
          `spotifyRefreshToken=${refreshToken}; Path=/; SameSite=Lax`,
        );
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
