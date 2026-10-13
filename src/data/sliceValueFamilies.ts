import type { DraftType } from "~/types";

/**
 * Formats whose slices are built the same way, so their slice values are
 * comparable. Player count doesn't move the distribution; slice shape does.
 */
const FAMILIES = {
  milty: ["milty4p", "milty5p", "milty", "milty7p", "milty8p"],
  miltyeq: ["miltyeq4p", "miltyeq5p", "miltyeq", "miltyeq7p", "miltyeq7plarge", "miltyeq8p"],
  heisen: ["heisen", "heisen8p"],
  std4p: ["std4p"],
} satisfies Record<string, DraftType[]>;

export type SliceValueFamily = keyof typeof FAMILIES;

export type SliceValueDistribution = {
  generatedAt: string;
  families: Partial<
    Record<
      SliceValueFamily,
      {
        drafts: number;
        /** 0th to 100th percentile of a set's average slice value. */
        averages: number[];
        /** 0th to 100th percentile of single slice values. */
        slices: number[];
      }
    >
  >;
};

export function sliceValueFamily(type: DraftType | undefined): SliceValueFamily | undefined {
  if (!type) return undefined;
  return (Object.keys(FAMILIES) as SliceValueFamily[]).find((family) =>
    (FAMILIES[family] as DraftType[]).includes(type),
  );
}
