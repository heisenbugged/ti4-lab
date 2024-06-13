import { useDraftV2 } from "~/draftStore";
import { useDraftConfig } from "./useDraftConfig";
import { HydratedPlayer, PlayerSelection } from "~/types";
import { hydrateMap } from "~/utils/map";
import { useMemo } from "react";
import { useOutletContext } from "@remix-run/react";

export function useHydratedDraft() {
  const { pickForAnyone } = useOutletContext<{
    pickForAnyone: boolean;
  }>();
  const config = useDraftConfig();
  const selectedPlayer = useDraftV2((state) => state.selectedPlayer);
  const presetMap = useDraftV2((state) => state.draft.presetMap);
  const slices = useDraftV2((state) => state.draft.slices);
  const players = useDraftV2((state) => state.draft.players);
  const pickOrder = useDraftV2((state) => state.draft.pickOrder);
  const selections = useDraftV2((state) => state.draft.selections);

  // TODO: Actually hydrate the players
  const hydratedPlayers = selections.reduce(
    (acc, selection) => {
      const playerIdx = acc.findIndex((p) => p.id === selection.playerId);
      if (playerIdx === -1) return acc;

      // NOTE: Assumes there is a single type of selection
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

      return acc;
    },
    [...players] as HydratedPlayer[],
  );

  // TODO: Compute currentPick
  const currentPick = selections.length;
  const activePlayerId = pickOrder[currentPick];
  const activePlayer = hydratedPlayers.find((p) => p.id === activePlayerId)!;

  // const selections = useDraftV2((state) => state.draft.selections);
  const hydratedMap = useMemo(
    () => hydrateMap(config, presetMap, slices, selections),
    [config, presetMap, slices, selections],
  );

  return {
    hydratedMap,
    hydratedPlayers,
    activePlayer,
    currentPick,
    lastEvent: "",
    currentlyPicking: activePlayerId === selectedPlayer || pickForAnyone,
  };
}
