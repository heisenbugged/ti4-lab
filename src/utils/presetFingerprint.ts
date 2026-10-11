/**
 * Layout fingerprints for matching drafts back to the preset map they were
 * played on. A fingerprint is the ordered list of system ids (rotation
 * dropped, Mecatol omitted) — the same whether the map came in via "Start
 * draft", the generator, or a copied map string. No `~/` imports so the
 * one-off scripts can load it directly.
 */

// Shorter layouts are almost all empty/random and would collide.
const MIN_SYSTEMS = 10;

type FingerprintTile = {
  idx?: number;
  type?: string;
  systemId?: string;
};

export function fingerprintFromMapString(mapString: string): string | null {
  const systems = mapString
    .split(",")
    .filter((token) => token !== "_" && token !== "X" && !token.startsWith("H"))
    .map((token) => token.split(":")[0]);
  return systems.length >= MIN_SYSTEMS ? systems.join(",") : null;
}

export function fingerprintFromMap(
  map: readonly FingerprintTile[] | undefined | null,
): string | null {
  if (!map) return null;
  const systems = map
    .filter((tile) => (tile.idx ?? 0) !== 0)
    .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
    .filter((tile) => tile.type === "SYSTEM" && tile.systemId)
    .map((tile) => tile.systemId as string);
  return systems.length >= MIN_SYSTEMS ? systems.join(",") : null;
}

/** Seats are the distinct home tiles (`H<seat>`) in the map string. */
export function playerCountFromMapString(mapString: string): number {
  const seats = new Set(
    mapString.split(",").filter((token) => /^H\d+$/.test(token)),
  );
  return seats.size;
}
