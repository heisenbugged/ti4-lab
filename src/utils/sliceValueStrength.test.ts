import { describe, expect, it } from "vitest";
import { describeStrength, sliceValueStrength } from "./sliceValueStrength";

describe("sliceValueStrength", () => {
  it("ranks a set against finished drafts of its format family", () => {
    const median = sliceValueStrength("milty", 11, "averages")!;
    expect(median.label).toBe("Typical");
    expect(median.percentile).toBeCloseTo(0.5, 1);

    // Player count doesn't change the family.
    expect(sliceValueStrength("milty4p", 11, "averages")!.formatName).toBe("Milty");
  });

  it("puts the tails in the outer bands", () => {
    expect(sliceValueStrength("milty", 8, "averages")!.label).toBe("Poor");
    expect(sliceValueStrength("milty", 14, "averages")!.label).toBe("Very rich");
    // Milty EQ slices run lower, so the same value reads richer there.
    expect(sliceValueStrength("miltyeq", 10.6, "averages")!.band).toBeGreaterThan(
      sliceValueStrength("milty", 10.6, "averages")!.band,
    );
  });

  it("describes the comparison in plain words", () => {
    const strength = sliceValueStrength("milty", 10.6, "averages")!;
    expect(describeStrength(strength)).toMatch(/^Poorer than \d+% of finished Milty drafts$/);
  });
});
