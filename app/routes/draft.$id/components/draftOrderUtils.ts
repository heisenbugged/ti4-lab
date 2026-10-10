import {
  Draft,
  DraftPick,
  DraftSelection,
  HydratedPlayer,
  HOME_PHASE,
  PRIORITY_PHASE,
} from "~/types";
import { factions } from "~/data/factionData";
import { playerColors } from "~/data/factionData";
import type { PlayerColor } from "~/ui";

export type DraftOrderEntry = {
  player: HydratedPlayer;
  idx: number;
  isActive: boolean;
  isPassed: boolean;
};

export function getDraftOrderEntries(
  pickOrder: DraftPick[],
  players: HydratedPlayer[],
  currentPick: number,
): DraftOrderEntry[] {
  const entries: DraftOrderEntry[] = [];

  pickOrder.forEach((playerId, idx) => {
    if (typeof playerId !== "number") return;
    if (playerId === PRIORITY_PHASE || playerId === HOME_PHASE) return;

    const player = players.find(({ id }) => id === playerId);
    if (!player) return;

    entries.push({
      player,
      idx,
      isActive: idx === currentPick,
      isPassed: idx < currentPick,
    });
  });

  return entries;
}

/** Split the pick order into rounds of one pick per player. */
export function getDraftOrderRounds(
  entries: DraftOrderEntry[],
  playerCount: number,
): DraftOrderEntry[][] {
  const rounds: DraftOrderEntry[][] = [];
  const size = Math.max(1, playerCount);
  for (let i = 0; i < entries.length; i += size) {
    rounds.push(entries.slice(i, i + size));
  }
  return rounds;
}

export const playerColorOf = (playerId: number) =>
  playerColors[playerId] as PlayerColor;

/** Seat letter shown in the player hex: A, B, C… */
export const playerLetter = (playerId: number) =>
  String.fromCharCode(65 + playerId);

/** "Emirates of Hacan" → "Hacan", "L1Z1X Mindnet" → "L1Z1X". */
export function shortFactionName(name: string) {
  const plain = name.replace(/^The /, "");
  const of = plain.lastIndexOf(" of ");
  if (of !== -1) return plain.slice(of + 4);
  return plain.split(" ")[0];
}

const ordinal = (n: number) => {
  if (n === 1) return "Speaker";
  const suffix = n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
};

/** Short label for what a pick took, for the pick order strip. */
export function shortSelectionLabel(
  selection: DraftSelection | undefined,
  draft: Pick<Draft, "slices">,
): string | undefined {
  if (!selection) return undefined;
  switch (selection.type) {
    case "SELECT_FACTION":
      return shortFactionName(factions[selection.factionId]?.name ?? "");
    case "SELECT_MINOR_FACTION":
      return shortFactionName(factions[selection.minorFactionId]?.name ?? "");
    case "BAN_FACTION":
      return `Ban ${shortFactionName(factions[selection.factionId]?.name ?? "")}`;
    case "SELECT_SLICE":
      return draft.slices[selection.sliceIdx]?.name ?? `Slice ${selection.sliceIdx + 1}`;
    case "SELECT_SPEAKER_ORDER":
      return ordinal(selection.speakerOrder + 1);
    case "SELECT_SEAT":
      return `Seat ${selection.seatIdx + 1}`;
    case "SELECT_PLAYER_COLOR":
      return selection.color;
    case "SELECT_REFERENCE_CARD_PACK":
      return `Pack ${selection.packIdx + 1}`;
    case "PLACE_TILE":
      return `Tile ${selection.systemId}`;
    default:
      return "Done";
  }
}

/** Sentence for the last pick, e.g. "Samwise the Brave took seat 2." */
export function describeSelection(
  selection: DraftSelection | undefined,
  draft: Pick<Draft, "slices">,
  players: { id: number; name: string }[],
): string | undefined {
  if (!selection) return undefined;
  const who =
    "playerId" in selection
      ? (players.find((p) => p.id === selection.playerId)?.name ?? "A player")
      : undefined;
  switch (selection.type) {
    case "SELECT_FACTION":
      return `${who} took ${factions[selection.factionId]?.name}.`;
    case "SELECT_MINOR_FACTION":
      return `${who} took ${factions[selection.minorFactionId]?.name} as their minor faction.`;
    case "BAN_FACTION":
      return `${who} banned ${factions[selection.factionId]?.name}.`;
    case "SELECT_SLICE":
      return `${who} took ${draft.slices[selection.sliceIdx]?.name ?? `slice ${selection.sliceIdx + 1}`}.`;
    case "SELECT_SPEAKER_ORDER":
      return selection.speakerOrder === 0
        ? `${who} took speaker.`
        : `${who} took ${ordinal(selection.speakerOrder + 1)} in speaker order.`;
    case "SELECT_SEAT":
      return `${who} took seat ${selection.seatIdx + 1}.`;
    case "SELECT_PLAYER_COLOR":
      return `${who} took ${selection.color.toLowerCase()}.`;
    case "SELECT_REFERENCE_CARD_PACK":
      return `${who} took reference card pack ${selection.packIdx + 1}.`;
    case "PLACE_TILE":
      return `${who} placed tile ${selection.systemId}.`;
    default:
      return undefined;
  }
}

/** "a faction, a slice and a seat" */
export function joinNeeds(needs: string[]) {
  if (needs.length <= 1) return needs[0] ?? "";
  return `${needs.slice(0, -1).join(", ")} and ${needs[needs.length - 1]}`;
}
