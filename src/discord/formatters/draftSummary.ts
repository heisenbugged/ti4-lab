import { Draft, HydratedPlayer } from "~/types";
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
    undefined,
    undefined,
    draft.settings,
  );

  const currentPick = draft.selections.length;
  const activePlayerId = getPlayerIdFromPick(draft.pickOrder[currentPick]);
  const nextPlayerId = getPlayerIdFromPick(draft.pickOrder[currentPick + 1]);

  const linesByPlayerId = hydratedPlayers.reduce(
    (acc, player) => {
      acc[player.id] = buildPlayerLine(
        player,
        draft,
        activePlayerId,
        nextPlayerId,
      );
      return acc;
    },
    {} as Record<number, string>,
  );

  const orderedLines = draft.pickOrder
    .slice(0, draft.players.length)
    .filter((pick): pick is number => typeof pick === "number")
    .map((playerId) => linesByPlayerId[playerId])
    .filter(Boolean);

  return ["# **__Draft Picks So Far__**:", ...orderedLines].join("\n");
}

function getPlayerIdFromPick(pick: Draft["pickOrder"][number] | undefined) {
  return typeof pick === "number" ? pick : undefined;
}

function buildPlayerLine(
  player: HydratedPlayer,
  draft: Draft,
  activePlayerId: number | undefined,
  nextPlayerId: number | undefined,
): string {
  const factionEmoji = getFactionEmoji(player);
  const sliceEmoji = getSliceEmoji(player, draft);
  const positionEmoji = getPositionEmoji(player);
  const playerName = formatPlayerName(player, activePlayerId, nextPlayerId);

  return [
    `> ${draft.pickOrder.indexOf(player.id) + 1}.`,
    factionEmoji,
    sliceEmoji,
    positionEmoji,
    playerName,
  ].join(" ");
}

function getFactionEmoji(player: HydratedPlayer): string {
  return player.faction ? (factionEmojis[player.faction] ?? unpickedFactionEmoji) : unpickedFactionEmoji;
}

function getSliceEmoji(player: HydratedPlayer, draft: Draft): string {
  if (player.sliceIdx === undefined) {
    return unpickedSliceEmoji;
  }

  const sliceName = draft.slices[player.sliceIdx].name
    .replace("Slice ", "")
    .slice(0, 1);

  const slicePosition = getAlphabetPosition(sliceName) - 1;
  return sliceEmojis[slicePosition];
}

function getPositionEmoji(player: HydratedPlayer): string {
  return player.seatIdx !== undefined
    ? positionEmojis[player.seatIdx]
    : unpickedPositionEmoji;
}

function formatPlayerName(
  player: HydratedPlayer,
  activePlayerId: number | undefined,
  nextPlayerId: number | undefined,
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
