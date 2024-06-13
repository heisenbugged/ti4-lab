import { draftStoreAtom, useDraftV2 } from "~/draftStore";
import { useDraftConfig } from "./useDraftConfig";
import { HydratedPlayer, PlayerSelection } from "~/types";
import { hydrateMap } from "~/utils/map";
import { useMemo } from "react";
import { useOutletContext } from "@remix-run/react";
import { atom } from "jotai/vanilla";
import { useAtom } from "jotai";
import { draftConfig } from "~/draft";

const hydratedPlayersAtom = atom((get) => {
  const store = get(draftStoreAtom);
  const selections = store.draft.selections;
  const players = store.draft.players;

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

      if (selection.type === "SELECT_SEAT") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          seatIdx: selection.seatIdx,
        };
      }

      return acc;
    },
    [...players] as HydratedPlayer[],
  );
});

const hydratedMapAtom = atom((get) => {
  const store = get(draftStoreAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  // the player selections are
  const playerSelections: PlayerSelection[] = hydratedPlayers.map((p) => ({
    playerId: p.id,
    sliceIdx: p.sliceIdx,
    seatIdx: p.seatIdx,
  }));

  return hydrateMap(
    draftConfig[store.draft.settings.type],
    store.draft.presetMap,
    store.draft.slices,
    playerSelections,
  );
});

export function useHydratedDraft() {
  const { pickForAnyone } = useOutletContext<{
    pickForAnyone: boolean;
  }>();
  const selectedPlayer = useDraftV2((state) => state.selectedPlayer);
  const pickOrder = useDraftV2((state) => state.draft.pickOrder);
  const selections = useDraftV2((state) => state.draft.selections);

  const [hydratedPlayers] = useAtom(hydratedPlayersAtom);
  const [hydratedMap] = useAtom(hydratedMapAtom);

  const currentPick = selections.length;
  const activePlayerId = pickOrder[currentPick];
  const activePlayer = hydratedPlayers.find((p) => p.id === activePlayerId)!;

  return {
    hydratedMap,
    hydratedPlayers,
    activePlayer,
    currentPick,
    lastEvent: "",
    currentlyPicking: activePlayerId === selectedPlayer || pickForAnyone,
  };
}
