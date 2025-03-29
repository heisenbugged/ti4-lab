import { useState } from "react";
import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { NumberStepper } from "~/components/NumberStepper";

export interface MiltyDraftSettings {
  minOptimal?: number;
  maxOptimal?: number;

  safePathToMecatol: number;
  highQualityAdjacent: number;
  minAlphaWormholes: number;
  minBetaWormholes: number;
  minLegendaries: number;
}

export const DEFAULT_MILTY_SETTINGS: MiltyDraftSettings = {
  minOptimal: 9,
  maxOptimal: 13,
  safePathToMecatol: 0,
  highQualityAdjacent: 0,
  minAlphaWormholes: 2,
  minBetaWormholes: 2,
  minLegendaries: 1,
};

type Props = {
  opened: boolean;
  settings: MiltyDraftSettings;
  onClose: () => void;
  onSave: (newSettings: MiltyDraftSettings) => void;
};

export function MiltySettingsModal({
  opened,
  onClose,
  settings,
  onSave,
}: Props) {
  const [localSettings, setLocalSettings] =
    useState<MiltyDraftSettings>(settings);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Milty Draft Settings"
      size="xl"
    >
      <Stack p="md">
        <Group align="flex-start">
          <Stack style={{ flex: 1 }}>
            <Group>
              <Text>Minimum Optimal Total</Text>
              <NumberStepper
                value={localSettings.minOptimal}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minOptimal: prev.minOptimal
                      ? prev.minOptimal - 1
                      : undefined,
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minOptimal: prev.minOptimal ? prev.minOptimal + 1 : 9,
                  }))
                }
                decreaseDisabled={
                  !localSettings.minOptimal || localSettings.minOptimal <= 5
                }
                increaseDisabled={
                  localSettings.minOptimal !== undefined &&
                  (localSettings.minOptimal >= 12 ||
                    (localSettings.maxOptimal !== undefined &&
                      localSettings.minOptimal >= localSettings.maxOptimal))
                }
              />
            </Group>

            <Group>
              <Text>Maximum Optimal Total</Text>
              <NumberStepper
                value={localSettings.maxOptimal}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    maxOptimal: prev.maxOptimal
                      ? prev.maxOptimal - 1
                      : undefined,
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    maxOptimal: prev.maxOptimal ? prev.maxOptimal + 1 : 11,
                  }))
                }
                decreaseDisabled={
                  !localSettings.maxOptimal ||
                  localSettings.maxOptimal <= 10 ||
                  (localSettings.minOptimal !== undefined &&
                    localSettings.maxOptimal <= localSettings.minOptimal)
                }
                increaseDisabled={
                  localSettings.maxOptimal !== undefined &&
                  localSettings.maxOptimal >= 15
                }
              />
            </Group>

            <Group>
              <Box style={{ maxWidth: "75%" }}>
                <Text>Slices with Safe Path to Mecatol</Text>
                <Text size="xs" color="dimmed">
                  Number of slices that must have a clear path to Mecatol
                  without anomalies on the straight line from home system to
                  center
                </Text>
              </Box>
              <NumberStepper
                value={localSettings.safePathToMecatol}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    safePathToMecatol: Math.max(0, prev.safePathToMecatol - 1),
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    safePathToMecatol: Math.min(6, prev.safePathToMecatol + 1),
                  }))
                }
                decreaseDisabled={localSettings.safePathToMecatol <= 0}
                increaseDisabled={localSettings.safePathToMecatol >= 6}
              />
            </Group>

            <Group>
              <Box style={{ maxWidth: "75%" }}>
                <Text>Slices with High-Quality Adjacent</Text>
                <Text size="xs" color="dimmed">
                  Number of slices that must have high-quality tiles adjacent to
                  home
                </Text>
              </Box>
              <NumberStepper
                value={localSettings.highQualityAdjacent}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    highQualityAdjacent: Math.max(
                      0,
                      prev.highQualityAdjacent - 1,
                    ),
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    highQualityAdjacent: Math.min(
                      6,
                      prev.highQualityAdjacent + 1,
                    ),
                  }))
                }
                decreaseDisabled={localSettings.highQualityAdjacent <= 0}
                increaseDisabled={localSettings.highQualityAdjacent >= 6}
              />
            </Group>
          </Stack>

          <Stack style={{ flex: 1 }}>
            <Group>
              <Box style={{ maxWidth: "75%" }}>
                <Text>Minimum Alpha Wormholes</Text>
                <Text size="xs" color="dimmed">
                  Minimum number of alpha wormholes required across all slices
                </Text>
              </Box>
              <NumberStepper
                value={localSettings.minAlphaWormholes}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minAlphaWormholes: Math.max(0, prev.minAlphaWormholes - 1),
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minAlphaWormholes: Math.min(12, prev.minAlphaWormholes + 1),
                  }))
                }
                decreaseDisabled={localSettings.minAlphaWormholes <= 0}
                increaseDisabled={localSettings.minAlphaWormholes >= 12}
              />
            </Group>

            <Group>
              <Box style={{ maxWidth: "75%" }}>
                <Text>Minimum Beta Wormholes</Text>
                <Text size="xs" color="dimmed">
                  Minimum number of beta wormholes required across all slices
                </Text>
              </Box>
              <NumberStepper
                value={localSettings.minBetaWormholes}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minBetaWormholes: Math.max(0, prev.minBetaWormholes - 1),
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minBetaWormholes: Math.min(12, prev.minBetaWormholes + 1),
                  }))
                }
                decreaseDisabled={localSettings.minBetaWormholes <= 0}
                increaseDisabled={localSettings.minBetaWormholes >= 12}
              />
            </Group>

            <Group>
              <Box style={{ maxWidth: "75%" }}>
                <Text>Minimum Legendary Planets</Text>
                <Text size="xs" color="dimmed">
                  Minimum number of legendary planets required across all slices
                </Text>
              </Box>
              <NumberStepper
                value={localSettings.minLegendaries}
                decrease={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minLegendaries: Math.max(0, prev.minLegendaries - 1),
                  }))
                }
                increase={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    minLegendaries: Math.min(6, prev.minLegendaries + 1),
                  }))
                }
                decreaseDisabled={localSettings.minLegendaries <= 0}
                increaseDisabled={localSettings.minLegendaries >= 6}
              />
            </Group>
          </Stack>
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
          >
            Save Settings
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
