import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { spotifyApi } from "~/vendors/spotifyApi";

const cookieOptions = { path: "/", sameSite: "lax" } as const;

/** Swaps the refresh cookie for a new access token (and cookie). */
export const refreshSpotifyToken = createServerFn({ method: "POST" }).handler(
  async () => {
    const refreshToken = getCookie("spotifyRefreshToken");
    if (!refreshToken) return null;

    try {
      const { accessToken, expiresIn } = await spotifyApi.refreshAccessToken(
        refreshToken,
        process.env.SPOTIFY_OAUTH_CLIENT_ID!,
        process.env.SPOTIFY_OAUTH_CLIENT_SECRET!,
      );
      setCookie("spotifyAccessToken", accessToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      });
      return accessToken;
    } catch {
      deleteCookie("spotifyAccessToken", cookieOptions);
      deleteCookie("spotifyRefreshToken", cookieOptions);
      return null;
    }
  },
);
