import { Draft, Player } from "~/types";
import { hydratePlayers } from "~/hooks/useHydratedDraft";
import {
  factionEmojis,
  unpickedFactionEmoji,
  sliceEmojis,
  unpickedSliceEmoji,
  positionEmojis,
  unpickedPositionEmoji,
  getAlphabetPosition,
} from "../constants/emojis";

export function getDraftSummaryMessage(draft: Draft): string {
  const hydratedPlayers = hydratePlayers(
    draft.players,
    draft.selections,
    draft.settings.draftSpeaker,
    draft.integrations.discord?.players,
  );

  const currentPick = draft.selections.length;
  const activePlayerId = draft.pickOrder[currentPick];
  const nextPlayerId = draft.pickOrder[currentPick + 1];

  const lines = hydratedPlayers.map((p) => {
    const factionEmoji = getFactionEmoji(p);
    const sliceEmoji = getSliceEmoji(p, draft);
    const positionEmoji = getPositionEmoji(p);
    const playerName = formatPlayerName(p, activePlayerId, nextPlayerId);

    return [
      `> ${draft.pickOrder.indexOf(p.id) + 1}.`,
      factionEmoji,
      sliceEmoji,
      positionEmoji,
      playerName,
    ].join(" ");
  });

  const draftOrder = draft.pickOrder.slice(0, draft.players.length);
  const orderedLines = draftOrder.map((id) => lines[id]);

  return ["# **__Draft Picks So Far__**:", ...orderedLines].join("\n");
}

function getFactionEmoji(player: Player): string {
  return player.faction ? factionEmojis[player.faction] : unpickedFactionEmoji;
}

function getSliceEmoji(player: Player, draft: Draft): string {
  if (player.sliceIdx === undefined) {
    return unpickedSliceEmoji;
  }

  const sliceName = draft.slices[player.sliceIdx].name
    .replace("Slice ", "")
    .slice(0, 1);

  const slicePosition = getAlphabetPosition(sliceName) - 1;
  return sliceEmojis[slicePosition];
}

function getPositionEmoji(player: Player): string {
  return player.seatIdx !== undefined
    ? positionEmojis[player.seatIdx]
    : unpickedPositionEmoji;
}

function formatPlayerName(
  player: Player,
  activePlayerId: number,
  nextPlayerId: number,
): string {
  let name = player.name;

  if (player.id === activePlayerId) {
    return `**__${name}   <- CURRENTLY DRAFTING__**`;
  }

  if (player.id === nextPlayerId) {
    return `*${name}   <- on deck*`;
  }

  return name;
}
