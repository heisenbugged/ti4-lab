/**
 * One-time curation pass for the community maps listing.
 *
 *   npx tsx scripts/curate-preset-maps.ts [dbPath] [--apply]
 *
 * 1. Recounts presetMaps.draftCount from every draft whose map layout
 *    matches a preset (only drafts created after the layout was first
 *    uploaded; re-uploads share one count on the copy that stays listed).
 *    Idempotent.
 * 2. Hides junk: never-drafted maps with throwaway names/descriptions,
 *    re-uploads of an existing layout, same-name re-saves by the same
 *    author, and maps without home systems. Only ever sets hidden = 1.
 *
 * Dry run unless --apply is passed. Needs migration 0014 (run the app once).
 */
import Database from "better-sqlite3";
import {
  fingerprintFromMap,
  fingerprintFromMapString,
  playerCountFromMapString,
} from "../app/utils/presetFingerprint";
import { authorKey } from "../app/utils/presetDiscovery";

type PresetRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  mapString: string;
  createdAt: string;
  draftCount: number;
  hidden: number;
};

const dbPath =
  process.argv[2] && !process.argv[2].startsWith("--")
    ? process.argv[2]
    : "sqlite.db";
const apply = process.argv.includes("--apply");

const db = new Database(dbPath);

const columns = db
  .prepare("SELECT name FROM pragma_table_info('presetMaps')")
  .all() as { name: string }[];
if (!columns.some((column) => column.name === "draftCount")) {
  console.error(
    "presetMaps.draftCount is missing — deploy/run the app so migration 0014 applies first.",
  );
  process.exit(1);
}

const presets = db
  .prepare(
    `SELECT id, slug, name, description, author, mapString, createdAt, draftCount, hidden
     FROM presetMaps ORDER BY createdAt ASC, id ASC`,
  )
  .all() as PresetRow[];

// ── Junk rules ───────────────────────────────────────────────────────────────

const JUNK_NAME =
  /^(test\s*\d*|t|map|untitled|new map|draft|first idea|second try|variant\s*\d*|[\d\s./_-]+)$/i;
const JUNK_TEXT =
  /^(test|t|nothing|nothin|none|draft|mine|map|base|first try|first map|final map|booh|\.|-)$/i;
const JUNK_AUTHOR = /^(test|t|\.|me|a|asdf)$/i;

// Strong reasons hide a map on their own; weak ones (an author called "Me",
// a two-letter name like "S4") only in combination.
type Reason = { text: string; strong: boolean };
const reasons = new Map<string, Reason[]>();
const flag = (preset: PresetRow, text: string, strong = true) =>
  reasons.set(preset.id, [...(reasons.get(preset.id) ?? []), { text, strong }]);
const isJunk = (preset: PresetRow) => {
  const found = reasons.get(preset.id) ?? [];
  return found.some((reason) => reason.strong) || found.length >= 2;
};

for (const preset of presets) {
  const name = preset.name.trim();
  const description = preset.description.trim();
  const author = preset.author.trim();

  if (JUNK_NAME.test(name) || /\btest\b/i.test(name)) {
    flag(preset, "throwaway name");
  } else if (name.length <= 2) {
    flag(preset, "very short name", false);
  }
  if (description.length < 6 || JUNK_TEXT.test(description)) {
    flag(preset, `throwaway description "${description}"`);
  }
  if (JUNK_AUTHOR.test(author)) {
    flag(preset, `throwaway author "${author}"`, false);
  }
  if (playerCountFromMapString(preset.mapString) === 0) {
    flag(preset, "no home systems");
  }
}

// Same author re-saving under the same name: keep the newest (later saves
// are usually the refined version), flag the rest.
const byAuthorAndName = new Map<string, PresetRow[]>();
for (const preset of presets) {
  const key = `${authorKey(preset.author)}\u0000${preset.name.trim().toLowerCase()}`;
  byAuthorAndName.set(key, [...(byAuthorAndName.get(key) ?? []), preset]);
}
for (const group of byAuthorAndName.values()) {
  const keep = group[group.length - 1];
  for (const preset of group.slice(0, -1)) {
    flag(preset, `re-save of "${keep.name}" (${keep.slug})`);
  }
}

// Re-uploads of the same layout: keep the oldest copy that isn't otherwise
// junk (e.g. "Thunder Dreaming" over an earlier upload named "TE"), and send
// all of the layout's plays to it.
const layoutGroups = new Map<string, PresetRow[]>();
for (const preset of presets) {
  const fingerprint = fingerprintFromMapString(preset.mapString);
  if (!fingerprint) continue;
  layoutGroups.set(fingerprint, [
    ...(layoutGroups.get(fingerprint) ?? []),
    preset,
  ]);
}
const creditByFingerprint = new Map<
  string,
  { keeper: PresetRow; since: string }
>();
for (const [fingerprint, group] of layoutGroups) {
  const keeper = group.find((preset) => !isJunk(preset)) ?? group[0];
  for (const preset of group) {
    if (preset !== keeper) flag(preset, `same layout as ${keeper.slug}`);
  }
  creditByFingerprint.set(fingerprint, { keeper, since: group[0].createdAt });
}

// ── Draft counts ─────────────────────────────────────────────────────────────

const draftCounts = new Map<string, number>();
const earliest = presets[0]?.createdAt ?? "";
const draftRows = db
  .prepare("SELECT data, createdAt FROM drafts WHERE createdAt >= ?")
  .iterate(earliest) as Iterable<{ data: string | Buffer; createdAt: string }>;

let scannedDrafts = 0;
for (const row of draftRows) {
  scannedDrafts++;
  let draft: { presetMap?: Parameters<typeof fingerprintFromMap>[0] };
  try {
    draft = JSON.parse(row.data.toString());
  } catch {
    continue;
  }
  const fingerprint = fingerprintFromMap(draft.presetMap);
  const credit = fingerprint && creditByFingerprint.get(fingerprint);
  // A draft from before the map was first uploaded is its source, not a play.
  if (!credit || row.createdAt <= credit.since) continue;
  draftCounts.set(
    credit.keeper.id,
    (draftCounts.get(credit.keeper.id) ?? 0) + 1,
  );
}

const countChanges = presets.filter(
  (preset) => (draftCounts.get(preset.id) ?? 0) !== preset.draftCount,
);
console.log(
  `Scanned ${scannedDrafts} drafts: ${[...draftCounts.values()].reduce((a, b) => a + b, 0)} plays across ${draftCounts.size} maps (${countChanges.length} counts change).`,
);

// ── Hide ─────────────────────────────────────────────────────────────────────

const describe = (preset: PresetRow) =>
  reasons
    .get(preset.id)!
    .map((reason) => reason.text)
    .join("; ");

// A map people actually draft on is never junk, whatever it's called.
const toHide = presets.filter(
  (preset) =>
    !preset.hidden && isJunk(preset) && (draftCounts.get(preset.id) ?? 0) === 0,
);
const sparedByPlays = presets.filter(
  (preset) => isJunk(preset) && (draftCounts.get(preset.id) ?? 0) > 0,
);

console.log(`\nHiding ${toHide.length} of ${presets.length} maps:`);
for (const preset of toHide) {
  console.log(
    `  ${preset.slug.padEnd(48)} by ${preset.author.padEnd(16)} — ${describe(preset)}`,
  );
}
if (sparedByPlays.length > 0) {
  console.log(`\nMatched a junk rule but kept because they've been drafted:`);
  for (const preset of sparedByPlays) {
    console.log(
      `  ${preset.slug.padEnd(48)} ${draftCounts.get(preset.id)} drafts — ${describe(preset)}`,
    );
  }
}
if (!apply) {
  console.log("\nDry run — nothing written. Re-run with --apply to save.");
  process.exit(0);
}

const setCount = db.prepare(
  "UPDATE presetMaps SET draftCount = ? WHERE id = ?",
);
const hide = db.prepare(
  "UPDATE presetMaps SET hidden = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
);
db.transaction(() => {
  for (const preset of countChanges) {
    setCount.run(draftCounts.get(preset.id) ?? 0, preset.id);
  }
  for (const preset of toHide) hide.run(preset.id);
})();
console.log(
  `\nApplied: ${countChanges.length} draft counts updated, ${toHide.length} maps hidden.`,
);
