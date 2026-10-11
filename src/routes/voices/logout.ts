import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/voices/logout")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const headers = new Headers({
          Location: new URL("/voices", request.url).toString(),
        });
        headers.append(
          "Set-Cookie",
          "spotifyAccessToken=; Path=/; Max-Age=0; SameSite=Lax",
        );
        headers.append(
          "Set-Cookie",
          "spotifyRefreshToken=; Path=/; Max-Age=0; SameSite=Lax",
        );
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
