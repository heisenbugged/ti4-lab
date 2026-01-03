import { LoaderFunctionArgs, redirect } from "react-router";
import { spotifyApi } from "~/vendors/spotifyApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/voices");
  }

  const redirectUrl = new URL(process.env.SPOTIFY_OAUTH_REDIRECT_URI!);
  const { accessToken, refreshToken, expiresIn } =
    await spotifyApi.exchangeCodeForToken(
      code,
      redirectUrl.toString(),
      process.env.SPOTIFY_OAUTH_CLIENT_ID!,
      process.env.SPOTIFY_OAUTH_CLIENT_SECRET!,
    );

  const response = redirect("/voices");

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
