import { useState } from "react";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { SettingStepper } from "~/components/SettingStepper";

export interface MiltyEqDraftSettings {
  minOptimal?: number;
  maxOptimal?: number;

  safePathToMecatol: number;
  highQualityAdjacent: number;
  minAlphaWormholes: number;
  minBetaWormholes: number;
  minLegendaries: number;
}

export const DEFAULT_MILTYEQ_SETTINGS: MiltyEqDraftSettings = {
  minOptimal: 6,
  maxOptimal: 10,
  safePathToMecatol: 0,
  highQualityAdjacent: 0,
  minAlphaWormholes: 2,
  minBetaWormholes: 2,
  minLegendaries: 1,
};

type Props = {
  opened: boolean;
  settings: MiltyEqDraftSettings;
  onClose: () => void;
  onSave: (newSettings: MiltyEqDraftSettings) => void;
};

export function MiltyEqSettingsModal({
  opened,
  onClose,
  settings,
  onSave,
}: Props) {
  const [localSettings, setLocalSettings] =
    useState<MiltyEqDraftSettings>(settings);

  const handleSettingChange = (
    property: keyof MiltyEqDraftSettings,
    value: number | undefined,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Milty EQ Draft Settings"
      size="xl"
    >
      <Stack p="md">
        <Group align="flex-start">
          <Stack style={{ flex: 1 }}>
            <SettingStepper
              label="Minimum Optimal Total"
              property="minOptimal"
              value={localSettings.minOptimal}
              onChange={handleSettingChange}
              allowUndefined={true}
              defaultValue={DEFAULT_MILTYEQ_SETTINGS.minOptimal}
            />

            <SettingStepper
              label="Maximum Optimal Total"
              property="maxOptimal"
              value={localSettings.maxOptimal}
              onChange={handleSettingChange}
              allowUndefined={true}
              defaultValue={DEFAULT_MILTYEQ_SETTINGS.maxOptimal}
            />

            <SettingStepper
              label="Slices with Safe Path to Mecatol"
              description="Number of slices that must have a clear path to Mecatol without anomalies on the straight line from home system to center"
              property="safePathToMecatol"
              value={localSettings.safePathToMecatol}
              onChange={handleSettingChange}
            />

            <SettingStepper
              label="Slices with High-Quality Adjacent"
              description="Number of slices that must have high-quality tiles adjacent to home"
              property="highQualityAdjacent"
              value={localSettings.highQualityAdjacent}
              onChange={handleSettingChange}
            />
          </Stack>

          <Stack style={{ flex: 1 }}>
            <SettingStepper
              label="Minimum Alpha Wormholes"
              description="Minimum number of alpha wormholes required across all slices"
              property="minAlphaWormholes"
              value={localSettings.minAlphaWormholes}
              onChange={handleSettingChange}
            />

            <SettingStepper
              label="Minimum Beta Wormholes"
              description="Minimum number of beta wormholes required across all slices"
              property="minBetaWormholes"
              value={localSettings.minBetaWormholes}
              onChange={handleSettingChange}
            />

            <SettingStepper
              label="Minimum Legendary Planets"
              description="Minimum number of legendary planets required across all slices"
              property="minLegendaries"
              value={localSettings.minLegendaries}
              onChange={handleSettingChange}
            />
          </Stack>
        </Group>

        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={() => {
              setLocalSettings(settings);
              onClose();
            }}
          >
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
