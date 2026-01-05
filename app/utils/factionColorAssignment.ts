import { FactionId } from "~/types";
import { factions, playerColors } from "~/data/factionData";

type PlayerColor = (typeof playerColors)[number];

const colorAffinityToPlayerColor: Record<string, PlayerColor> = {
  green: "green",
  blue: "blue",
  yellow: "orange",
  red: "red",
  purple: "violet",
  black: "gray",
  orange: "orange",
  pink: "magenta",
};

function getFactionColorScore(
  factionId: FactionId,
  color: PlayerColor,
): number {
  const faction = factions[factionId];
  if (!faction?.colorAffinity) return 0;

  const affinityKey = Object.keys(colorAffinityToPlayerColor).find(
    (key) => colorAffinityToPlayerColor[key] === color,
  );

  if (!affinityKey) return 0;

  return (
    faction.colorAffinity[affinityKey as keyof typeof faction.colorAffinity] ??
    0
  );
}

export function assignColorsToFactions(
  factionIds: FactionId[],
): Map<FactionId, PlayerColor> {
  const assignment = new Map<FactionId, PlayerColor>();
  const availableColors = [...playerColors];
  const unassignedFactions = [...factionIds];

  if (unassignedFactions.length === 0) {
    return assignment;
  }

  if (unassignedFactions.length > availableColors.length) {
    throw new Error(
      `Cannot assign colors: ${unassignedFactions.length} factions but only ${availableColors.length} colors available`,
    );
  }

  const colorScores: Array<{
    factionId: FactionId;
    color: PlayerColor;
    score: number;
  }> = [];

  for (const factionId of unassignedFactions) {
    for (const color of availableColors) {
      const score = getFactionColorScore(factionId, color);
      colorScores.push({ factionId, color, score });
    }
  }

  colorScores.sort((a, b) => b.score - a.score);

  const assignedFactions = new Set<FactionId>();
  const usedColors = new Set<PlayerColor>();

  for (const { factionId, color } of colorScores) {
    if (assignedFactions.has(factionId)) continue;
    if (usedColors.has(color)) continue;

    assignment.set(factionId, color);
    assignedFactions.add(factionId);
    usedColors.add(color);

    if (assignedFactions.size === unassignedFactions.length) break;
  }

  for (const factionId of unassignedFactions) {
    if (!assignment.has(factionId)) {
      let bestColor: PlayerColor | null = null;
      let bestScore = -1;

      for (const color of availableColors) {
        if (usedColors.has(color)) continue;

        const score = getFactionColorScore(factionId, color);
        if (score > bestScore) {
          bestScore = score;
          bestColor = color;
        }
      }

      if (bestColor) {
        assignment.set(factionId, bestColor);
        usedColors.add(bestColor);
      } else {
        const remainingColor = availableColors.find((c) => !usedColors.has(c));
        if (remainingColor) {
          assignment.set(factionId, remainingColor);
          usedColors.add(remainingColor);
        }
      }
    }
  }

  return assignment;
}
