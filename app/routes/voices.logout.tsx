import { redirect } from "react-router";

export async function loader() {
  const response = redirect("/voices");

  response.headers.append(
    "Set-Cookie",
    "spotifyAccessToken=; Path=/; Max-Age=0; SameSite=Lax",
  );
  response.headers.append(
    "Set-Cookie",
    "spotifyRefreshToken=; Path=/; Max-Age=0; SameSite=Lax",
  );

  return response;
}
