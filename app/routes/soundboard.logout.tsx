import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = redirect("/soundboard");

  // Clear cookies by setting them to empty values with immediate expiration
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
