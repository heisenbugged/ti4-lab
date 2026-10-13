/**
 * Parses the hub import box: draft links separated by commas, spaces or new
 * lines. Accepts full urls (any host, so staging and old domains work), bare
 * paths, and bare draft names like `brave-red-fox`.
 */

export type ImportTarget =
  | { kind: "draft"; input: string; key: string }
  | { kind: "draftId"; input: string; key: string }
  | { kind: "multidraft"; input: string; key: string }
  | { kind: "invalid"; input: string };

export const MAX_IMPORT_ITEMS = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function stripPngSuffix(segment: string) {
  return segment.replace(/\.png$/i, "");
}

function pathOf(token: string): string | undefined {
  if (/^https?:\/\//i.test(token)) {
    try {
      return new URL(token).pathname;
    } catch {
      return undefined;
    }
  }
  // "tidraft.com/draft/x" without a scheme
  const hostPath = token.match(/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)$/i);
  if (hostPath) return hostPath[1];
  if (token.startsWith("/")) return token;
  return undefined;
}

export function parseImportToken(rawToken: string): ImportTarget {
  const input = rawToken.trim();
  const path = pathOf(input);

  if (path !== undefined) {
    const segments = path.split("/").filter(Boolean).map(decodeURIComponent);
    const [section, name] = segments;
    if (section === "draft" && name) {
      const key = stripPngSuffix(name).toLowerCase();
      if (UUID.test(key)) return { kind: "draftId", input, key };
      if (NAME.test(key) && key !== "new" && key !== "prechoice") {
        return { kind: "draft", input, key };
      }
    }
    if (section === "multidraft" && name && NAME.test(name)) {
      return { kind: "multidraft", input, key: name.toLowerCase() };
    }
    return { kind: "invalid", input };
  }

  if (UUID.test(input)) return { kind: "draftId", input, key: input.toLowerCase() };
  if (NAME.test(input)) return { kind: "draft", input, key: input.toLowerCase() };
  return { kind: "invalid", input };
}

/** Splits and de-duplicates the pasted text. */
export function parseImportText(text: string): ImportTarget[] {
  const seen = new Set<string>();
  const targets: ImportTarget[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    if (!token.trim()) continue;
    const target = parseImportToken(token);
    const id = target.kind === "invalid" ? `invalid:${target.input}` : `${target.kind}:${target.key}`;
    if (seen.has(id)) continue;
    seen.add(id);
    targets.push(target);
  }
  return targets;
}
