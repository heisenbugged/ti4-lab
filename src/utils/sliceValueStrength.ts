import { SLICE_VALUE_DISTRIBUTION } from "~/data/sliceValueDistribution";
import { sliceValueFamily, type SliceValueFamily } from "~/data/sliceValueFamilies";
import type { DraftType } from "~/types";

/** Bands by percentile: the outer tenth at each end, then the middle split 25/30/25. */
export const STRENGTH_BANDS = [
  { label: "Poor", upTo: 0.1 },
  { label: "Lean", upTo: 0.35 },
  { label: "Typical", upTo: 0.65 },
  { label: "Rich", upTo: 0.9 },
  { label: "Very rich", upTo: 1 },
] as const;

const FAMILY_NAMES: Record<SliceValueFamily, string> = {
  milty: "Milty",
  miltyeq: "Milty EQ",
  heisen: "Nucleus",
  std4p: "4P Small",
};

export type SliceValueStrength = {
  /** Share of finished drafts below this value, 0 to 1. */
  percentile: number;
  /** Index into STRENGTH_BANDS. */
  band: number;
  label: (typeof STRENGTH_BANDS)[number]["label"];
  formatName: string;
};

/**
 * Where a value sits among finished drafts of the same format: a set's
 * average slice value ("averages") or a single slice ("slices").
 */
export function sliceValueStrength(
  type: DraftType | undefined,
  value: number,
  kind: "averages" | "slices",
): SliceValueStrength | undefined {
  const family = sliceValueFamily(type);
  const distribution = family && SLICE_VALUE_DISTRIBUTION.families[family];
  if (!family || !distribution) return undefined;
  const points = distribution[kind];
  // Mid-rank, so a common value like 9.5 lands in the middle of its tie.
  const below = points.filter((p) => p < value).length;
  const equal = points.filter((p) => p === value).length;
  const percentile = (below + equal / 2) / points.length;
  const band = STRENGTH_BANDS.findIndex((b) => percentile < b.upTo || b.upTo === 1);
  return {
    percentile,
    band,
    label: STRENGTH_BANDS[band].label,
    formatName: FAMILY_NAMES[family],
  };
}

/** "Richer than 64% of finished Milty drafts" */
export function describeStrength({ percentile, formatName }: SliceValueStrength, of = "drafts") {
  const pct = Math.round(percentile * 100);
  const total = `finished ${formatName} ${of}`;
  return pct >= 50 ? `Richer than ${pct}% of ${total}` : `Poorer than ${100 - pct}% of ${total}`;
}
