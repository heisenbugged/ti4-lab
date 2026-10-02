import {
  Box,
  Button,
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
import { SimultaneousPickType, SystemId } from "~/types";
import { IconCheck } from "@tabler/icons-react";
import { SystemTileCard } from "~/components/SystemTileCard";
import { SimultaneousPhaseLayout } from "../components/SimultaneousPhaseLayout";

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
  const { stageSimultaneousPick } = useSyncDraft();
  const texasDraft = useDraft((state) => state.draft.texasDraft);
  const [pendingPick, setPendingPick] = useState<SystemId | null>(null);

  const phase = useSimultaneousPickPhase(phaseType);

  const options: SystemId[] =
    phase.currentPlayer && texasDraft?.tileHands
      ? (texasDraft.tileHands[color][phase.currentPlayer.id] ?? [])
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

  const confirmPendingPick = () => {
    if (!pendingPick || !phase.currentPlayer) return;
    stageSimultaneousPick(phaseType, phase.currentPlayer.id, pendingPick);
    setPendingPick(null);
  };

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName={title}
      phaseColor={color}
      description={description}
      showPickAnyWarning
      maw={1400}
      sidebarSpan={{ base: 12, md: 4 }}
      contentSpan={{ base: 12, md: 8 }}
    >
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
    </SimultaneousPhaseLayout>
  );
}
