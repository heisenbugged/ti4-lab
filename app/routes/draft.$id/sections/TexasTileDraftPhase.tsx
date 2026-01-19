import {
  Box,
  Button,
  Center,
  Grid,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { useDraft } from "~/draftStore";
import { useState } from "react";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { PlayerSelectionSidebar } from "../components/PlayerSelectionSidebar";
import { SpectatorModeNotice } from "../components/SpectatorModeNotice";
import { SimultaneousPickType, SystemId } from "~/types";
import { IconCheck } from "@tabler/icons-react";
import { SimultaneousPhaseHeader } from "../components/SimultaneousPhaseHeader";
import { SystemTileCard } from "~/components/SystemTileCard";
import { useAdminControls } from "../components/useAdminControls";

type Props = {
  phase: SimultaneousPickType;
  title: string;
  description: string;
  color: "blue" | "red";
};

export function TexasTileDraftPhase({
  phase: phaseType,
  title,
  description,
  color,
}: Props) {
  const { stageSimultaneousPick, undoLastPick } = useSyncDraft();
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
  const texasDraft = useDraft((state) => state.draft.texasDraft);
  const [pendingPick, setPendingPick] = useState<SystemId | null>(null);

  const phase = useSimultaneousPickPhase(phaseType);

  const options: SystemId[] =
    phase.currentPlayer && texasDraft?.tileHands
      ? texasDraft.tileHands[color][phase.currentPlayer.id] ?? []
      : [];
  const selectedTile =
    phase.currentPlayer && phase.stagingValues
      ? (phase.stagingValues[phase.currentPlayer.id] as SystemId | undefined)
      : undefined;

  const keptTiles: SystemId[] =
    phase.currentPlayer && texasDraft?.tileKeeps
      ? [
          ...(texasDraft.tileKeeps.blue[phase.currentPlayer.id] ?? []),
          ...(texasDraft.tileKeeps.red[phase.currentPlayer.id] ?? []),
        ]
      : [];

  const isSpectatorMode = selectedPlayer === -1;

  const handleUndo = async () => {
    if (confirm("Are you sure you want to undo the last selection?")) {
      await undoLastPick();
    }
  };

  const confirmPendingPick = () => {
    if (!pendingPick || !phase.currentPlayer) return;
    stageSimultaneousPick(phaseType, phase.currentPlayer.id, pendingPick);
    setPendingPick(null);
  };

  const phaseColor = color === "blue" ? "blue" : "red";

  return (
    <Box mih="100vh">
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SimultaneousPhaseHeader
        phaseName={title}
        phaseColor={phaseColor}
        description={description}
        adminMode={adminMode}
        onAdminToggle={handleAdminToggle}
        showPickForAnyoneControl={showPickForAnyoneControl}
        pickForAnyone={pickForAnyone}
        onTogglePickForAnyone={() => setPickForAnyone(!pickForAnyone)}
        showUndo={showUndoLastSelection}
        onUndo={handleUndo}
        undoDisabled={selections.length === 0}
        showPickAnyWarning={true}
      />

      <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />

      {/* Main content */}
      <Center p="md" pt="lg">
        <Grid maw={1400} w="100%" gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
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

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Kept tiles section */}
              {keptTiles.length > 0 && (
                <Box>
                  <Group gap="xs" mb="xs">
                    <IconCheck
                      size={14}
                      style={{ color: "var(--mantine-color-green-5)" }}
                    />
                    <Text size="xs" fw={600} c="green.5">
                      Kept
                    </Text>
                  </Group>
                  <Group gap="sm">
                    {keptTiles.map((systemId) => (
                      <SystemTileCard
                        key={systemId}
                        systemId={systemId}
                        radius={44}
                        padding={6}
                        borderRadius="var(--mantine-radius-sm)"
                      />
                    ))}
                  </Group>
                </Box>
              )}

              {/* Available tiles to pick from */}
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb="sm">
                  Choose a tile to keep
                </Text>
                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
                  {options.map((systemId) => {
                    const isSelected = selectedTile === systemId;
                    const canClick = phase.canSelect && phase.currentPlayer;
                    return (
                      <SystemTileCard
                        key={systemId}
                        systemId={systemId}
                        radius={56}
                        padding={10}
                        selected={isSelected}
                        showOverlay={true}
                        onClick={
                          canClick
                            ? () => {
                                setPendingPick(systemId);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </SimpleGrid>
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>
      </Center>
      <Modal
        opened={pendingPick !== null}
        onClose={() => setPendingPick(null)}
        title="Confirm tile"
        centered
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            confirmPendingPick();
          }
        }}
      >
        <Stack gap="md">
          <Text size="sm">Keep this tile?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingPick(null)}>
              Cancel
            </Button>
            <Button color="green" onClick={confirmPendingPick} autoFocus>
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
