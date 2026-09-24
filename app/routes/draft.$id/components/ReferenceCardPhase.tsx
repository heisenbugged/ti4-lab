import { Box, Center, Grid, MantineColor } from "@mantine/core";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useReferenceCardSelectionPhase } from "~/hooks/useReferenceCardSelectionPhase";
import { useSimultaneousUndo } from "~/hooks/useSimultaneousUndo";
import { PlayerSelectionSidebar } from "./PlayerSelectionSidebar";
import { ReferenceCardSelectionGrid } from "./ReferenceCardSelectionGrid";
import { useDraft } from "~/draftStore";
import { AdminPasswordModal } from "./AdminPasswordModal";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SpectatorModeNotice } from "./SpectatorModeNotice";
import { SimultaneousPhaseHeader } from "./SimultaneousPhaseHeader";
import { useAdminControls } from "./useAdminControls";

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
  const {
    adminMode,
    pickForAnyone,
    setPickForAnyone,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  } = useAdminControls();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);

  const phase = useReferenceCardSelectionPhase({
    label,
    phase: phaseType,
    stageAction: (playerId, factionId) =>
      stageSimultaneousPick(phaseType, playerId, factionId),
    showPriorityValueAsDisabled,
  });
  const undo = useSimultaneousUndo(
    phaseType,
    phase.currentPlayer?.id,
    phase.stagingValues,
  );
  if (!phase.pack) return <LoadingOverlay />;

  // Spectator mode: allow browsing when no selected player (not logged in as any player)
  const isSpectatorMode = selectedPlayer === -1;

  return (
    <Box mih="100vh">
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SimultaneousPhaseHeader
        phaseName={phaseName}
        phaseColor={phaseColor}
        description={description}
        adminMode={adminMode}
        onAdminToggle={handleAdminToggle}
        showPickForAnyoneControl={showPickForAnyoneControl}
        pickForAnyone={pickForAnyone}
        onTogglePickForAnyone={() => setPickForAnyone(!pickForAnyone)}
        showUndo={showUndoLastSelection}
        onUndoPick={undo.handleUndoPick}
        onUndoPhase={undo.handleUndoPhase}
        undoPickDisabled={undo.undoPickDisabled}
        undoPhaseDisabled={undo.undoPhaseDisabled}
      />

      <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />

      <Center p="md" pt="lg">
        <Grid
          maw={1600}
          w="100%"
          gutter="xl"
          style={{ alignItems: "flex-start" }}
        >
          <Grid.Col span={sidebarSpan}>
            <PlayerSelectionSidebar
              players={phase.hydratedPlayers}
              pickForAnyone={phase.pickForAnyone}
              selectedPlayerId={phase.selectedPlayerId}
              defaultPlayerId={phase.defaultPlayerId}
              stagingValues={phase.stagingValues}
              onPlayerSelect={phase.setSelectedPlayerId}
              onPlayerHover={phase.setHoveredPlayerId}
              currentPlayerId={phase.currentPlayer?.id}
              spectatorMode={isSpectatorMode}
            />
          </Grid.Col>

          <Grid.Col span={gridSpan}>
            <ReferenceCardSelectionGrid
              title={phase.title}
              pack={phase.pack}
              selectedCard={phase.selectedCard}
              canSelect={phase.canSelect}
              onSelectCard={phase.handleSelectCard}
              spectatorMode={isSpectatorMode}
              pickForAnyone={phase.pickForAnyone}
              disabledCards={phase.disabledCards}
            />
          </Grid.Col>
        </Grid>
      </Center>
    </Box>
  );
}
