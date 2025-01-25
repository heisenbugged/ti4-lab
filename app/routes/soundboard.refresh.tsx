import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { spotifyApi } from "~/vendors/spotifyApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = request.headers.get("Cookie");
  const refreshToken = cookies
    ?.split(";")
    .find((c) => c.trim().startsWith("spotifyRefreshToken="))
    ?.split("=")[1];

  if (!refreshToken) {
    return redirect("/soundboard");
  }

  try {
    const { accessToken, expiresIn } = await spotifyApi.refreshAccessToken(
      refreshToken,
      process.env.SPOTIFY_OAUTH_CLIENT_ID!,
      process.env.SPOTIFY_OAUTH_CLIENT_SECRET!,
    );

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `spotifyAccessToken=${accessToken}; Path=/; Max-Age=${expiresIn}; SameSite=Lax`,
    );

    return json(
      { success: true, accessToken },
      {
        headers,
        status: 200,
      },
    );
  } catch (error) {
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "spotifyAccessToken=; Path=/; Max-Age=0; SameSite=Lax",
    );
    headers.append(
      "Set-Cookie",
      "spotifyRefreshToken=; Path=/; Max-Age=0; SameSite=Lax",
    );

    return json(
      { success: false },
      {
        headers,
        status: 401,
      },
    );
  }
}
