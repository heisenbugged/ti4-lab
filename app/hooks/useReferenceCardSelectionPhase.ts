import { useCallback } from "react";
import { factions as allFactions } from "~/data/factionData";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { FactionId } from "~/types";

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
  const base = useSimultaneousPickPhase(phase);
  const {
    draft,
    hydratedPlayers,
    pickForAnyone,
    selectedPlayerId,
    currentPlayer,
    canSelect,
  } = base;
  const stagingValues = base.stagingValues as
    | Record<number, FactionId>
    | undefined;

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

  const disabledCards =
    showPriorityValueAsDisabled && playerToShow?.priorityValueFactionId
      ? [playerToShow.priorityValueFactionId]
      : [];

  const selectedCard = playerToShow
    ? stagingValues?.[playerToShow.id]
    : undefined;
  const hasStaged = selectedCard !== undefined;

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

  return {
    ...base,
    stagingValues,
    pack,
    hasStaged,
    selectedCard,
    title,
    handleSelectCard,
    disabledCards,
  };
}
