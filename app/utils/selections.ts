import { factions } from "~/data/factionData";
import { Draft, DraftSelection } from "~/types";

export function draftSelectionToMessage(
  playerName: string,
  selection: DraftSelection,
  draft: Draft,
) {
  if (selection.type === "SELECT_SPEAKER_ORDER") {
    return `${playerName} selected speaker order: ${selection.speakerOrder + 1}`;
  }
  if (selection.type === "SELECT_SLICE") {
    const sliceName = draft.slices[selection.sliceIdx].name;
    return `${playerName} selected slice: ${sliceName}`;
  }
  if (selection.type === "SELECT_FACTION") {
    const faction = factions[selection.factionId];
    return `${playerName} selected faction: ${faction.name}`;
  }
  if (selection.type === "SELECT_MINOR_FACTION") {
    const minorFaction = factions[selection.minorFactionId];
    return `${playerName} selected minor faction: ${minorFaction.name}`;
  }
  if (selection.type === "SELECT_SEAT") {
    return `${playerName} selected seat: ${selection.seatIdx + 1}`;
  }
  if (selection.type === "SELECT_PLAYER_COLOR") {
    return `${playerName} selected color: ${selection.color}`;
  }

  if (selection.type === "BAN_FACTION") {
    return `${playerName} banned faction: ${selection.factionId}`;
  }

  return "";
}
