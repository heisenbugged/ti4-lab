import { MantineColor } from "@mantine/core";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useReferenceCardSelectionPhase } from "~/hooks/useReferenceCardSelectionPhase";
import { ReferenceCardSelectionGrid } from "./ReferenceCardSelectionGrid";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SimultaneousPhaseLayout } from "./SimultaneousPhaseLayout";

type ColSpan = { base: number; md?: number; lg: number };

type Props = {
  phase: "priorityValue" | "homeSystem";
  label: string;
  phaseName: string;
  phaseColor: MantineColor;
  description: string;
  showPriorityValueAsDisabled?: boolean;
  sidebarSpan: ColSpan;
  gridSpan: ColSpan;
};

export function ReferenceCardPhase({
  phase: phaseType,
  label,
  phaseName,
  phaseColor,
  description,
  showPriorityValueAsDisabled,
  sidebarSpan,
  gridSpan,
}: Props) {
  const { stageSimultaneousPick } = useSyncDraft();
  const phase = useReferenceCardSelectionPhase({
    label,
    phase: phaseType,
    stageAction: (playerId, factionId) =>
      stageSimultaneousPick(phaseType, playerId, factionId),
    showPriorityValueAsDisabled,
  });
  if (!phase.pack) return <LoadingOverlay />;

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName={phaseName}
      phaseColor={phaseColor}
      description={description}
      maw={1600}
      gridStyle={{ alignItems: "flex-start" }}
      sidebarSpan={sidebarSpan}
      contentSpan={gridSpan}
    >
      <ReferenceCardSelectionGrid
        title={phase.title}
        pack={phase.pack}
        selectedCard={phase.selectedCard}
        canSelect={phase.canSelect}
        onSelectCard={phase.handleSelectCard}
        spectatorMode={phase.isSpectatorMode}
        pickForAnyone={phase.pickForAnyone}
        disabledCards={phase.disabledCards}
      />
    </SimultaneousPhaseLayout>
  );
}
