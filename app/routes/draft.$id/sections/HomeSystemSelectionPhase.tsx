import { Box, Center, Grid } from "@mantine/core";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useReferenceCardSelectionPhase } from "~/hooks/useReferenceCardSelectionPhase";
import { PlayerSelectionSidebar } from "../components/PlayerSelectionSidebar";
import { ReferenceCardSelectionGrid } from "../components/ReferenceCardSelectionGrid";
import { useDraft } from "~/draftStore";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SpectatorModeNotice } from "../components/SpectatorModeNotice";
import { SimultaneousPhaseHeader } from "../components/SimultaneousPhaseHeader";
import { useAdminControls } from "../components/useAdminControls";

export function HomeSystemSelectionPhase() {
  const { stageHomeSystem, undoLastPick } = useSyncDraft();
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
  const selections = useDraft((state) => state.draft.selections);
  const selectedPlayer = useDraft((state) => state.selectedPlayer);

  const phase = useReferenceCardSelectionPhase({
    label: "Home System",
    phase: "homeSystem",
    stageAction: stageHomeSystem,
    showPriorityValueAsDisabled: true,
  });

  // Spectator mode: if no pack available, show loading
  if (!phase.pack) return <LoadingOverlay />;

  // Spectator mode: allow browsing when no selected player (not logged in as any player)
  const isSpectatorMode = selectedPlayer === -1;

  const handleUndo = async () => {
    if (confirm("Are you sure you want to undo the last selection?")) {
      await undoLastPick();
    }
  };

  return (
    <Box mih="100vh">
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SimultaneousPhaseHeader
        phaseName="Home System Selection"
        phaseColor="green"
        description="Select your home system card"
        adminMode={adminMode}
        onAdminToggle={handleAdminToggle}
        showPickForAnyoneControl={showPickForAnyoneControl}
        pickForAnyone={pickForAnyone}
        onTogglePickForAnyone={() => setPickForAnyone(!pickForAnyone)}
        showUndo={showUndoLastSelection}
        onUndo={handleUndo}
        undoDisabled={selections.length === 0}
      />

      <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />

      <Center p="md" pt="lg">
        <Grid
          maw={1600}
          w="100%"
          gutter="xl"
          style={{ alignItems: "flex-start" }}
        >
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
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

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <ReferenceCardSelectionGrid
              title={phase.title}
              pack={phase.pack}
              selectedCard={phase.selectedCard}
              canSelect={phase.canSelect}
              onSelectCard={phase.handleSelectCard}
              disabledCards={phase.disabledCards}
              spectatorMode={isSpectatorMode}
              pickForAnyone={phase.pickForAnyone}
            />
          </Grid.Col>
        </Grid>
      </Center>
    </Box>
  );
}
