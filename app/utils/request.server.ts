export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

// Crawlers, link unfurlers (Discord/Slack/etc.) and scripted clients.
const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|preview|unfurl|embed|facebookexternalhit|headless|lighthouse|curl|wget|python|go-http|node-fetch|axios/i;

/** Requests that shouldn't count as a person looking at a page. */
export function isNonHumanRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent");
  if (!userAgent || BOT_USER_AGENT.test(userAgent)) return true;
  // Speculative prefetch/prerender, not a visit.
  const purpose =
    request.headers.get("sec-purpose") ?? request.headers.get("purpose");
  return purpose != null && /prefetch|prerender/i.test(purpose);
}
