import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { spotifyApi } from "~/vendors/spotifyApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/soundboard");
  }

  const { accessToken, refreshToken, expiresIn } =
    await spotifyApi.exchangeCodeForToken(
      code,
      process.env.SPOTIFY_OAUTH_REDIRECT_URI!,
      process.env.SPOTIFY_OAUTH_CLIENT_ID!,
      process.env.SPOTIFY_OAUTH_CLIENT_SECRET!,
    );

  const response = redirect("/soundboard");

  // Set cookies with tokens
  response.headers.append(
    "Set-Cookie",
    `spotifyAccessToken=${accessToken}; Path=/; Max-Age=${expiresIn}; SameSite=Lax`,
  );
  response.headers.append(
    "Set-Cookie",
    `spotifyRefreshToken=${refreshToken}; Path=/; SameSite=Lax`,
  );

  return response;
}
