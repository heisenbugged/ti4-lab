import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";

// The old fly.dev hostname is permanently moved to the real domain.
const canonicalHost = createMiddleware().server(({ request, next }) => {
  const url = new URL(request.url);
  if (url.hostname === "ti4-lab.fly.dev") {
    const location = new URL(url.pathname + url.search, "https://tidraft.com");
    return new Response(null, {
      status: 301,
      headers: { Location: location.toString() },
    });
  }
  return next();
});

const csrf = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalHost, csrf],
}));
