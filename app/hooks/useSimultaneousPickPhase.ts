import { useState } from "react";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { SimultaneousPickType } from "~/types";

export function useSimultaneousPickPhase(phase: SimultaneousPickType) {
  const { draft, selectedPlayer } = useDraft();
  const { hydratedPlayers } = useHydratedDraft();
  const { pickForAnyone, setPickForAnyone } = useSafeOutletContext();

  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const stagingValues = draft.stagedSelections?.[phase];

  const defaultPlayerId = hydratedPlayers.find(
    (p) => stagingValues?.[p.id] === undefined,
  )?.id;

  const viewingPlayerId = pickForAnyone
    ? (selectedPlayerId ?? defaultPlayerId)
    : selectedPlayer;

  const currentPlayer = hydratedPlayers.find((p) => p.id === viewingPlayerId);
  const hasStaged = currentPlayer
    ? stagingValues?.[currentPlayer.id] !== undefined
    : false;
  const canSelect = currentPlayer ? !hasStaged : false;

  const onTogglePickForAnyone = (checked: boolean) => {
    setPickForAnyone(checked);
    setSelectedPlayerId(null);
  };

  return {
    draft,
    hydratedPlayers,
    stagingValues,
    pickForAnyone,
    onTogglePickForAnyone,
    hoveredPlayerId,
    setHoveredPlayerId,
    selectedPlayerId,
    setSelectedPlayerId,
    defaultPlayerId,
    currentPlayer,
    canSelect,
    hasStaged,
  };
}
