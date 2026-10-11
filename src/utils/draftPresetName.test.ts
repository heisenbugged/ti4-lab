import { describe, expect, it } from "vitest";
import {
  finalizeDraftPresetName,
  sanitizeDraftPresetName,
} from "./draftPresetName";

describe("draftPresetName", () => {
  it("lowercases and replaces invalid characters with hyphens", () => {
    expect(sanitizeDraftPresetName("Round 1 / Table_2!")).toBe(
      "round-1-table-2-",
    );
  });

  it("collapses repeated hyphens and strips leading ones", () => {
    expect(sanitizeDraftPresetName("--a---b")).toBe("a-b");
  });

  it("keeps a trailing hyphen while typing but strips it on finalize", () => {
    expect(sanitizeDraftPresetName("abc-")).toBe("abc-");
    expect(finalizeDraftPresetName("abc-")).toBe("abc");
  });

  it("caps the length", () => {
    expect(sanitizeDraftPresetName("a".repeat(100))).toHaveLength(64);
  });

  it("finalizes to a valid slug, or empty when nothing usable remains", () => {
    expect(finalizeDraftPresetName("LSGC4 Round 1")).toBe("lsgc4-round-1");
    expect(finalizeDraftPresetName("-abc-")).toBe("abc");
    expect(finalizeDraftPresetName("")).toBe("");
    expect(finalizeDraftPresetName("--!!--")).toBe("");
  });
});
