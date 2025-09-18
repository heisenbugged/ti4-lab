import { useState, useEffect } from "react";
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

export const getMiltyEqSettings = (hasPok: boolean): MiltyEqDraftSettings => {
  if (hasPok) {
    return DEFAULT_MILTYEQ_SETTINGS;
  }
  
  return {
    ...DEFAULT_MILTYEQ_SETTINGS,
    minOptimal: 0,
    maxOptimal: 24,
    minAlphaWormholes: 2,
    minBetaWormholes: 2, 
    minLegendaries: 0,
  };
};

type Props = {
  opened: boolean;
  settings: MiltyEqDraftSettings;
  onClose: () => void;
  onSave: (newSettings: MiltyEqDraftSettings) => void;
  constraints?: {
    maxAlphaWormholes: number;
    maxBetaWormholes: number;
    maxLegendaries: number;
  };
};

export function MiltyEqSettingsModal({
  opened,
  onClose,
  settings,
  onSave,
  constraints,
}: Props) {
  const [localSettings, setLocalSettings] =
    useState<MiltyEqDraftSettings>(settings);

  useEffect(() => {
    if (constraints) {
      setLocalSettings(prev => ({
        ...prev,
        minAlphaWormholes: Math.min(prev.minAlphaWormholes, constraints.maxAlphaWormholes),
        minBetaWormholes: Math.min(prev.minBetaWormholes, constraints.maxBetaWormholes),
        minLegendaries: Math.min(prev.minLegendaries, constraints.maxLegendaries),
      }));
    }
  }, [constraints]);

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
              description={`Minimum number of alpha wormholes required across all slices${constraints ? ` (max available: ${constraints.maxAlphaWormholes})` : ''}`}
              property="minAlphaWormholes"
              value={localSettings.minAlphaWormholes}
              onChange={handleSettingChange}
              max={constraints?.maxAlphaWormholes}
            />

            <SettingStepper
              label="Minimum Beta Wormholes"
              description={`Minimum number of beta wormholes required across all slices${constraints ? ` (max available: ${constraints.maxBetaWormholes})` : ''}`}
              property="minBetaWormholes"
              value={localSettings.minBetaWormholes}
              onChange={handleSettingChange}
              max={constraints?.maxBetaWormholes}
            />

            <SettingStepper
              label="Minimum Legendary Planets"
              description={`Minimum number of legendary planets required across all slices${constraints ? ` (max available: ${constraints.maxLegendaries})` : ''}`}
              property="minLegendaries"
              value={localSettings.minLegendaries}
              onChange={handleSettingChange}
              max={constraints?.maxLegendaries}
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
