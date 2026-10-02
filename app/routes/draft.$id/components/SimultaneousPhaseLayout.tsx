import { CSSProperties, ReactNode } from "react";
import { Box, Center, Grid, GridColProps, MantineColor } from "@mantine/core";
import { useSimultaneousUndo } from "~/hooks/useSimultaneousUndo";
import { SimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { AdminPasswordModal } from "./AdminPasswordModal";
import { PlayerSelectionSidebar } from "./PlayerSelectionSidebar";
import { SimultaneousPhaseHeader } from "./SimultaneousPhaseHeader";
import { SpectatorModeNotice } from "./SpectatorModeNotice";
import { useAdminControls } from "./useAdminControls";

type Props = {
  phase: SimultaneousPickPhase;
  phaseName: string;
  phaseColor: MantineColor;
  description: string;
  showPickAnyWarning?: boolean;
  maw: number;
  gridStyle?: CSSProperties;
  sidebarSpan: GridColProps["span"];
  contentSpan: GridColProps["span"];
  children: ReactNode;
};

export function SimultaneousPhaseLayout({
  phase,
  phaseName,
  phaseColor,
  description,
  showPickAnyWarning,
  maw,
  gridStyle,
  sidebarSpan,
  contentSpan,
  children,
}: Props) {
  const {
    adminMode,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  } = useAdminControls();
  const undo = useSimultaneousUndo(
    phase.phase,
    phase.currentPlayer?.id,
    phase.stagingValues,
  );

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
        pickForAnyone={phase.pickForAnyone}
        onTogglePickForAnyone={phase.togglePickForAnyone}
        showUndo={showUndoLastSelection}
        onUndoPick={undo.handleUndoPick}
        onUndoPhase={undo.handleUndoPhase}
        undoPickDisabled={undo.undoPickDisabled}
        undoPhaseDisabled={undo.undoPhaseDisabled}
        showPickAnyWarning={showPickAnyWarning}
      />

      <SpectatorModeNotice isSpectatorMode={phase.isSpectatorMode} />

      <Center p="md" pt="lg">
        <Grid maw={maw} w="100%" gutter="xl" style={gridStyle}>
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
              spectatorMode={phase.isSpectatorMode}
            />
          </Grid.Col>

          <Grid.Col span={contentSpan}>{children}</Grid.Col>
        </Grid>
      </Center>
    </Box>
  );
}
