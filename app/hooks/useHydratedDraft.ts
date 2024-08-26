import { draftStoreAtom, useDraft } from "~/draftStore";
import {
  Player,
  DraftSelection,
  HydratedPlayer,
  PlayerSelection,
} from "~/types";
import { hydrateMap } from "~/utils/map";
import { useOutletContext } from "@remix-run/react";
import { atom } from "jotai/vanilla";
import { useAtom } from "jotai";
import { draftConfig } from "~/draft";
import { factionSystems } from "~/data/systemData";

export function hydratePlayers(
  players: Player[],
  selections: DraftSelection[],
  draftSpeaker: boolean = false,
): HydratedPlayer[] {
  return selections.reduce(
    (acc, selection) => {
      const playerIdx = acc.findIndex((p) => p.id === selection.playerId);
      if (playerIdx === -1) return acc;

      if (selection.type === "SELECT_SPEAKER_ORDER") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          speakerOrder: selection.speakerOrder,
        };
      }

      if (selection.type === "SELECT_SLICE") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          sliceIdx: selection.sliceIdx,
        };
      }

      if (selection.type === "SELECT_FACTION") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          faction: selection.factionId,
        };
      }

      if (selection.type === "SELECT_MINOR_FACTION") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          minorFaction: selection.minorFactionId,
        };
      }

      if (selection.type === "SELECT_SEAT") {
        const updated = {
          ...acc[playerIdx],
          seatIdx: selection.seatIdx,
        };
        if (!draftSpeaker) {
          updated.speakerOrder = selection.seatIdx;
        }

        acc[playerIdx] = updated;
      }

      if (selection.type === "SELECT_PLAYER_COLOR") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          factionColor: selection.color,
        };
      }

      return acc;
    },
    [...players] as HydratedPlayer[],
  );
}

export const computePlayerSelections = (hydratedPlayers: HydratedPlayer[]) =>
  hydratedPlayers.map((p) => ({
    playerId: p.id,
    sliceIdx: p.sliceIdx,
    seatIdx: p.seatIdx,
    minorFaction: p.minorFaction,
  }));

export const hydratedPlayersAtom = atom((get) => {
  const draft = get(draftStoreAtom).draft;
  return hydratePlayers(
    draft.players,
    draft.selections,
    draft.settings.draftSpeaker,
  );
});

export const hydratedMapAtom = atom((get) => {
  const store = get(draftStoreAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  return hydrateMap(
    draftConfig[store.draft.settings.type],
    store.draft.presetMap,
    store.draft.slices,
    computePlayerSelections(hydratedPlayers),
  );
});

export const hydratedMapStringAtom = atom((get) => {
  const hydratedMap = get(hydratedMapAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  // slice to remove mecatol
  return hydratedMap
    .slice(1, hydratedMap.length)
    .map((t) => {
      if (t.type === "HOME") {
        const player = hydratedPlayers.find((p) => p.id === t.playerId);
        if (player?.faction === undefined) return "0";
        return factionSystems[player.faction]?.id ?? "0";
      }
      if (t.type === "SYSTEM") return t.systemId;
      return "-1";
    })
    .join(" ");
});

export function useHydratedDraft() {
  const ctx = useOutletContext<{
    pickForAnyone: boolean;
  }>();
  const pickForAnyone = ctx ? ctx.pickForAnyone : false;
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const hydrated = useDraft((state) => state.hydrated);

  const [hydratedPlayers] = useAtom(hydratedPlayersAtom);
  const [hydratedMap] = useAtom(hydratedMapAtom);

  const currentPick = selections.length;
  const activePlayerId = pickOrder[currentPick];
  const activePlayer = hydratedPlayers.find((p) => p.id === activePlayerId)!;
  const draftFinished = hydrated && currentPick >= pickOrder.length;

  return {
    hydratedMap,
    hydratedPlayers,
    activePlayer,
    currentPick,
    lastEvent: "",
    currentlyPicking: activePlayerId === selectedPlayer || pickForAnyone,
    draftFinished,
  };
}
