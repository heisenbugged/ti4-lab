import { describe, expect, it } from "vitest";
import { parseImportText, parseImportToken } from "./hubImport";

describe("parseImportToken", () => {
  it("reads full draft urls, including replay, raw and png links", () => {
    for (const url of [
      "https://tidraft.com/draft/brave-red-fox",
      "https://tidraft.com/draft/brave-red-fox/replay",
      "https://tidraft.com/draft/brave-red-fox/raw",
      "https://tidraft.com/draft/brave-red-fox.png",
      "http://localhost:3000/draft/Brave-Red-Fox?x=1#top",
      "tidraft.com/draft/brave-red-fox",
      "/draft/brave-red-fox",
    ]) {
      expect(parseImportToken(url)).toMatchObject({ kind: "draft", key: "brave-red-fox" });
    }
  });

  it("reads bare pretty names and legacy uuids", () => {
    expect(parseImportToken("brave-red-fox")).toMatchObject({ kind: "draft", key: "brave-red-fox" });
    expect(parseImportToken("2ram-acamar-zeta")).toMatchObject({ kind: "draft" });
    expect(
      parseImportToken("https://tidraft.com/draft/0b8f6a8e-6d5e-4b0c-9a51-1f5f2e7c9d10"),
    ).toMatchObject({ kind: "draftId", key: "0b8f6a8e-6d5e-4b0c-9a51-1f5f2e7c9d10" });
  });

  it("reads multidraft links", () => {
    expect(parseImportToken("https://tidraft.com/multidraft/calm-blue-sky")).toMatchObject({
      kind: "multidraft",
      key: "calm-blue-sky",
    });
  });

  it("rejects links that aren't drafts", () => {
    expect(parseImportToken("https://tidraft.com/maps/cool-map")).toMatchObject({ kind: "invalid" });
    expect(parseImportToken("https://tidraft.com/draft/new")).toMatchObject({ kind: "invalid" });
    expect(parseImportToken("not a draft!")).toMatchObject({ kind: "invalid" });
  });
});

describe("parseImportText", () => {
  it("splits on commas, spaces and new lines, and drops duplicates", () => {
    const targets = parseImportText(
      "https://tidraft.com/draft/a-b-c, a-b-c\n/draft/d-e-f ,, https://tidraft.com/draft/g-h-i/replay",
    );
    expect(targets.map((t) => ("key" in t ? t.key : t.input))).toEqual(["a-b-c", "d-e-f", "g-h-i"]);
  });
});
