import { useState } from "react";
import { Button, Modal } from "~/ui";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useReferenceCardSelectionPhase } from "~/hooks/useReferenceCardSelectionPhase";
import { factions as allFactions } from "~/data/factionData";
import { FactionId } from "~/types";
import { NewDraftReferenceCard } from "~/routes/draft/new/-components/NewDraftReferenceCard";
import { ReferenceCardSelectionGrid } from "./ReferenceCardSelectionGrid";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SimultaneousPhaseLayout } from "./SimultaneousPhaseLayout";
import { PhaseColor } from "./SimultaneousPhaseHeader";

type Props = {
  phase: "priorityValue" | "homeSystem";
  label: string;
  phaseName: string;
  phaseColor: PhaseColor;
  description: string;
  showPriorityValueAsDisabled?: boolean;
  /** Below this breakpoint the player list stacks above the cards. */
  stackBelow?: "md" | "lg";
};

export function ReferenceCardPhase({
  phase: phaseType,
  label,
  phaseName,
  phaseColor,
  description,
  showPriorityValueAsDisabled,
  stackBelow,
}: Props) {
  const { stageSimultaneousPick } = useSyncDraft();
  const [pendingCard, setPendingCard] = useState<FactionId | null>(null);
  const phase = useReferenceCardSelectionPhase({
    label,
    phase: phaseType,
    stageAction: (playerId, factionId) =>
      stageSimultaneousPick(phaseType, playerId, factionId),
    showPriorityValueAsDisabled,
  });
  if (!phase.pack) return <LoadingOverlay />;

  const lowerLabel = label.toLowerCase();
  // The hook titles in title case; show it in sentence case.
  const title = phase.title
    .replace("Select Your", "Select your")
    .replace(`${label} Card`, `${lowerLabel} card`)
    .replace(`Select ${label} for`, `Select ${lowerLabel} for`);

  const requestSelect = (factionId: FactionId) => {
    if (!phase.canSelect || !phase.currentPlayer) return;
    setPendingCard(factionId);
  };

  const confirmSelect = async () => {
    const factionId = pendingCard;
    setPendingCard(null);
    if (!factionId || !phase.canSelect || !phase.currentPlayer) return;
    await stageSimultaneousPick(phaseType, phase.currentPlayer.id, factionId);
  };

  const pendingFaction = pendingCard ? allFactions[pendingCard] : undefined;

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName={phaseName}
      phaseColor={phaseColor}
      description={description}
      maw={1600}
      stackBelow={stackBelow}
    >
      <ReferenceCardSelectionGrid
        title={title}
        pack={phase.pack}
        selectedCard={phase.selectedCard}
        canSelect={phase.canSelect}
        onSelectCard={requestSelect}
        spectatorMode={phase.isSpectatorMode}
        pickForAnyone={phase.pickForAnyone}
        disabledCards={phase.disabledCards}
        disabledNote={
          showPriorityValueAsDisabled ? "Your priority value card" : undefined
        }
      />

      <Modal
        opened={pendingCard !== null}
        onClose={() => setPendingCard(null)}
        title={
          pendingFaction
            ? `Select ${pendingFaction.name} as your ${lowerLabel} card?`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setPendingCard(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSelect} autoFocus>
              Select {lowerLabel} card
            </Button>
          </>
        }
      >
        {pendingFaction && <NewDraftReferenceCard faction={pendingFaction} />}
      </Modal>
    </SimultaneousPhaseLayout>
  );
}
