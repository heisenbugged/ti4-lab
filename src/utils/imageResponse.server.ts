const IMMUTABLE = "public, max-age=31536000, immutable";

/** Sends the client to an image already on the CDN. */
export function redirectToImage(url: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": IMMUTABLE },
  });
}

export function pngResponse(buffer: Buffer, cacheControl = IMMUTABLE) {
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": cacheControl },
  });
}
