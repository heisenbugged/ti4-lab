import { expect, test, describe } from "vitest";
import { assignColorsToFactions } from "./factionColorAssignment";
import { FactionId } from "~/types";

describe("assignColorsToFactions", () => {
  test("assigns colors to a single faction", () => {
    const factions: FactionId[] = ["jolnar"];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(1);
    expect(assignment.get("jolnar")).toBe("blue");
  });

  test("assigns colors to multiple factions with different affinities", () => {
    const factions: FactionId[] = ["jolnar", "nekro", "arborec"];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(3);
    expect(assignment.get("jolnar")).toBe("blue");
    expect(assignment.get("nekro")).toBe("red");
    expect(assignment.get("arborec")).toBe("green");
  });

  test("assigns colors optimally when factions compete for same color", () => {
    const factions: FactionId[] = ["creuss", "jolnar", "sol"];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(3);
    expect(assignment.get("creuss")).toBe("blue");
    const jolnarColor = assignment.get("jolnar");
    const solColor = assignment.get("sol");
    expect(jolnarColor).toBeDefined();
    expect(solColor).toBeDefined();
    expect(jolnarColor).not.toBe(solColor);
  });

  test("handles factions with no color affinity", () => {
    const factions: FactionId[] = ["sardakk", "barony"];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(2);

    expect(assignment.get("sardakk")).toBeDefined();
    expect(assignment.get("barony")).toBeDefined();
  });

  test("assigns colors to 6 factions (typical game size)", () => {
    const factions: FactionId[] = [
      "creuss",
      "nekro",
      "arborec",
      "mahact",
      "empyrean",
      "argent",
    ];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(6);

    expect(assignment.get("creuss")).toBe("blue");
    expect(assignment.get("nekro")).toBe("red");
    expect(assignment.get("arborec")).toBe("green");
    expect(assignment.get("mahact")).toBe("orange");
    expect(assignment.get("empyrean")).toBe("violet");
    expect(assignment.get("argent")).toBe("orange");
  });

  test("maximizes total score across all assignments", () => {
    const factions: FactionId[] = ["creuss", "jolnar", "sol"];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.get("creuss")).toBe("blue");

    const jolnarColor = assignment.get("jolnar");
    const solColor = assignment.get("sol");

    expect(jolnarColor).toBeDefined();
    expect(solColor).toBeDefined();
    expect(jolnarColor).not.toBe("blue");
  });

  test("throws error when more factions than available colors", () => {
    const factions: FactionId[] = [
      "creuss",
      "nekro",
      "arborec",
      "mahact",
      "empyrean",
      "argent",
      "jolnar",
      "sol",
      "barony",
      "sardakk",
    ];

    expect(() => assignColorsToFactions(factions)).toThrow();
  });

  test("handles exactly 8 factions (maximum players)", () => {
    const factions: FactionId[] = [
      "creuss",
      "nekro",
      "arborec",
      "mahact",
      "empyrean",
      "argent",
      "jolnar",
      "sol",
    ];
    const assignment = assignColorsToFactions(factions);

    expect(assignment.size).toBe(8);

    const assignedColors = new Set(assignment.values());
    expect(assignedColors.size).toBe(8);
    for (const factionId of factions) {
      expect(assignment.has(factionId)).toBe(true);
      expect(assignment.get(factionId)).toBeDefined();
    }
  });
});
