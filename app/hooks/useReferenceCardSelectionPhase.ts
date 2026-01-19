import { useState, useCallback } from "react";
import { factions as allFactions } from "~/data/factionData";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { Draft, FactionId } from "~/types";

export type ReferenceCardSelectionConfig = {
  label: string;
  phase: "priorityValue" | "homeSystem";
  stageAction: (playerId: number, factionId: FactionId) => Promise<void>;
  showPriorityValueAsDisabled?: boolean;
};

export function useReferenceCardSelectionPhase({
  label,
  phase,
  stageAction,
  showPriorityValueAsDisabled = false,
}: ReferenceCardSelectionConfig) {
  const { draft, selectedPlayer } = useDraft();
  const { hydratedPlayers } = useHydratedDraft();
  const { pickForAnyone, setPickForAnyone } = useSafeOutletContext();

  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const legacyStaging =
    phase === "priorityValue"
      ? (draft as Draft & { stagingPriorityValues?: Record<number, FactionId> })
          .stagingPriorityValues
      : (draft as Draft & { stagingHomeSystemValues?: Record<number, FactionId> })
          .stagingHomeSystemValues;
  const stagingValues =
    (draft.stagedSelections?.[phase] as Record<number, FactionId> | undefined) ??
    legacyStaging;

  const defaultPlayerId = hydratedPlayers.find(
    (p) => stagingValues?.[p.id] === undefined,
  )?.id;

  const viewingPlayerId = pickForAnyone
    ? (selectedPlayerId ?? defaultPlayerId)
    : selectedPlayer;

  const currentPlayer = hydratedPlayers.find((p) => p.id === viewingPlayerId);

  // Spectator mode: if no current player, find first player with a pack
  const spectatorPlayer =
    !currentPlayer && hydratedPlayers.length > 0
      ? selectedPlayerId !== null
        ? hydratedPlayers.find((p) => p.id === selectedPlayerId)
        : hydratedPlayers.find((p) => p.referenceCardPackIdx !== undefined)
      : undefined;

  const playerToShow = currentPlayer ?? spectatorPlayer;

  const packIdx = playerToShow?.referenceCardPackIdx;
  const pack =
    packIdx === undefined
      ? undefined
      : draft.availableReferenceCardPacks?.[packIdx];

  const disabledCards = showPriorityValueAsDisabled && playerToShow?.priorityValueFactionId
    ? [playerToShow.priorityValueFactionId]
    : [];

  const selectedCard = playerToShow
    ? stagingValues?.[playerToShow.id]
    : undefined;
  const hasStaged = selectedCard !== undefined;
  const canSelect = currentPlayer ? !hasStaged : false;

  const title = !playerToShow
    ? ""
    : canSelect
      ? pickForAnyone && selectedPlayerId
        ? `Select ${label} for ${playerToShow.name}`
        : `Select Your ${label} Card`
      : hasStaged
        ? "Waiting for other players..."
        : "You have already selected";

  const handleSelectCard = useCallback(
    async (factionId: FactionId) => {
      if (!canSelect || !currentPlayer) return;
      if (
        confirm(
          `Select ${allFactions[factionId].name} as your ${label.toLowerCase()} card?`,
        )
      ) {
        await stageAction(currentPlayer.id, factionId);
      }
    },
    [canSelect, currentPlayer, stageAction, label],
  );

  const onTogglePickForAnyone = useCallback(
    (checked: boolean) => {
      setPickForAnyone(checked);
      setSelectedPlayerId(null);
    },
    [setPickForAnyone],
  );

  return {
    draft,
    hydratedPlayers,
    pickForAnyone,
    setPickForAnyone,
    onTogglePickForAnyone,
    hoveredPlayerId,
    setHoveredPlayerId,
    selectedPlayerId,
    setSelectedPlayerId,
    defaultPlayerId,
    currentPlayer,
    pack,
    hasStaged,
    canSelect,
    selectedCard,
    title,
    handleSelectCard,
    stagingValues,
    disabledCards,
  };
}
