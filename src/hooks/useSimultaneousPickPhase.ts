import { useState } from "react";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraftUiSettings } from "~/draftUiSettings";
import { Draft, SimultaneousPickType } from "~/types";

type LegacyStagingDraft = Draft & {
  stagingPriorityValues?: Record<number, string>;
  stagingHomeSystemValues?: Record<number, string>;
};

function legacyStagingValues(draft: Draft, phase: SimultaneousPickType) {
  const legacy = draft as LegacyStagingDraft;
  if (phase === "priorityValue") return legacy.stagingPriorityValues;
  if (phase === "homeSystem") return legacy.stagingHomeSystemValues;
  return undefined;
}

export type SimultaneousPickPhase = ReturnType<typeof useSimultaneousPickPhase>;

export function useSimultaneousPickPhase(phase: SimultaneousPickType) {
  const { draft, selectedPlayer } = useDraft();
  const { hydratedPlayers } = useHydratedDraft();
  const { pickForAnyone, setPickForAnyone } = useDraftUiSettings();

  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const stagingValues =
    draft.stagedSelections?.[phase] ?? legacyStagingValues(draft, phase);

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

  const togglePickForAnyone = () => {
    setPickForAnyone(!pickForAnyone);
    setSelectedPlayerId(null);
  };

  return {
    phase,
    draft,
    hydratedPlayers,
    stagingValues,
    isSpectatorMode: selectedPlayer === -1,
    pickForAnyone,
    togglePickForAnyone,
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
