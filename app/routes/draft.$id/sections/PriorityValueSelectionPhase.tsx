import {
  Group,
  Stack,
  Switch,
  Center,
  Button,
  Title,
  Text,
  Grid,
} from "@mantine/core";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useReferenceCardSelectionPhase } from "~/hooks/useReferenceCardSelectionPhase";
import { PlayerSelectionSidebar } from "../components/PlayerSelectionSidebar";
import { ReferenceCardSelectionGrid } from "../components/ReferenceCardSelectionGrid";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useDraft } from "~/draftStore";
import { useState } from "react";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { notifications } from "@mantine/notifications";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SpectatorModeNotice } from "../components/SpectatorModeNotice";

export function PriorityValueSelectionPhase() {
  const { stagePriorityValue, undoLastPick } = useSyncDraft();
  const { adminMode, setAdminMode } = useSafeOutletContext();
  const selections = useDraft((state) => state.draft.selections);
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const adminPassword = useDraft((state) => state.draft.settings.adminPassword);
  const hasAdminPassword = adminPassword !== undefined;

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const phase = useReferenceCardSelectionPhase({
    label: "Priority Value",
    selectStagingValues: (d) => d.stagingPriorityValues,
    stageAction: stagePriorityValue,
  });
  if (!phase.pack) return <LoadingOverlay />;

  // Spectator mode: allow browsing when no selected player (not logged in as any player)
  const isSpectatorMode = selectedPlayer === -1;

  const handleAdminPasswordSubmit = (password: string) => {
    if (password === adminPassword) {
      setAdminMode(true);
    } else {
      notifications.show({
        title: "Incorrect password",
        message: "Please try again",
        color: "red",
      });
    }
    setPasswordModalOpen(false);
  };

  const showPickForAnyoneControl = !hasAdminPassword || adminMode;
  const showUndoLastSelection = !hasAdminPassword || adminMode;

  return (
    <Stack gap="xl" h="100vh" p="xl">
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <Group justify="flex-end">
        {showUndoLastSelection && (
          <Button
            onClick={async () => {
              if (
                confirm("Are you sure you want to undo the last selection?")
              ) {
                await undoLastPick();
              }
            }}
            disabled={selections.length === 0}
          >
            Undo Last Selection
          </Button>
        )}
        {showPickForAnyoneControl && (
          <Switch
            label="Pick for anyone"
            checked={phase.pickForAnyone}
            onChange={(e) =>
              phase.onTogglePickForAnyone(e.currentTarget.checked)
            }
          />
        )}
        <Switch
          label="Admin mode"
          checked={adminMode}
          onChange={(e) => {
            if (!e.currentTarget.checked) {
              setAdminMode(false);
              return;
            }
            if (hasAdminPassword) {
              setPasswordModalOpen(true);
            } else {
              setAdminMode(e.currentTarget.checked);
            }
          }}
        />
      </Group>

      <Stack gap="xs" align="center">
        <Title order={1}>Priority Value Selection</Title>
        <Text size="md" c="dimmed" ta="center" maw={600}>
          Select your priority value card. The priority order determines speaker
          order, with lower values getting earlier picks.
        </Text>
        <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />
      </Stack>

      <Center style={{ flex: 1 }}>
        <Grid
          maw={1600}
          w="100%"
          gutter="xl"
          style={{ alignItems: "flex-start" }}
        >
          <Grid.Col span={{ base: 12, lg: 4 }}>
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

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <ReferenceCardSelectionGrid
              title={phase.title}
              pack={phase.pack}
              selectedCard={phase.selectedCard}
              canSelect={phase.canSelect}
              onSelectCard={phase.handleSelectCard}
              spectatorMode={isSpectatorMode}
              pickForAnyone={phase.pickForAnyone}
            />
          </Grid.Col>
        </Grid>
      </Center>
    </Stack>
  );
}
