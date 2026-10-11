import type { DraftType } from "~/types";
import { draftConfig } from "./draftConfig";

/**
 * Formats that share slice geometry across player counts, so slices can be
 * kept as-is when players are added or removed in the draft builder.
 */
const FORMAT_FAMILIES: DraftType[][] = [
  ["milty4p", "milty5p", "milty", "milty7p", "milty8p"],
  [
    "miltyeq4p",
    "miltyeq5p",
    "miltyeq",
    "miltyeq7p",
    "miltyeq7plarge",
    "miltyeq8p",
  ],
  ["heisen", "heisen8p"],
];

/** The format in the same family as `type` that seats `playerCount` players. */
export function formatForPlayerCount(
  type: DraftType,
  playerCount: number,
): DraftType | undefined {
  if (draftConfig[type].numPlayers === playerCount) return type;
  const family = FORMAT_FAMILIES.find((formats) => formats.includes(type));
  return family?.find((t) => draftConfig[t].numPlayers === playerCount);
}
