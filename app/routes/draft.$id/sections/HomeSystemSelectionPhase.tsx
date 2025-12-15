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
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { PlayerSelectionSidebar } from "../components/PlayerSelectionSidebar";
import { ReferenceCardSelectionGrid } from "../components/ReferenceCardSelectionGrid";
import { useDraft } from "~/draftStore";
import { useState } from "react";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { notifications } from "@mantine/notifications";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SpectatorModeNotice } from "../components/SpectatorModeNotice";

export function HomeSystemSelectionPhase() {
  const { stageHomeSystem, undoLastPick } = useSyncDraft();
  const { adminMode, setAdminMode } = useSafeOutletContext();
  const selections = useDraft((state) => state.draft.selections);
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const adminPassword = useDraft((state) => state.draft.settings.adminPassword);
  const hasAdminPassword = adminPassword !== undefined;

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const phase = useReferenceCardSelectionPhase({
    label: "Home System",
    selectStagingValues: (d) => d.stagingHomeSystemValues,
    stageAction: stageHomeSystem,
    showPriorityValueAsDisabled: true,
  });

  // Spectator mode: if no pack available, show loading
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

      <Stack gap="xs" align="center">
        <Title order={1}>Home System Selection</Title>
        <Text size="md" c="dimmed" ta="center" maw={700}>
          Select your home system card. This determines which faction&apos;s
          home system tile you will use. The remaining card in your pack will
          automatically become your starting fleet.
        </Text>
        <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />
      </Stack>

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

      <Center style={{ flex: 1 }}>
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
    </Stack>
  );
}
