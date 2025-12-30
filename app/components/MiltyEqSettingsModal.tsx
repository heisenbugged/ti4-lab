import { useState } from "react";
import { Button, Group, Modal, SimpleGrid, Text } from "@mantine/core";
import { CompactSetting } from "~/components/CompactSetting";
import { SettingsSection } from "~/components/SettingsSection";
import {
  IconChartBar,
  IconRoute,
  IconAlien,
  IconSettings,
} from "@tabler/icons-react";

export interface MiltyEqDraftSettings {
  minSliceValue?: number;
  maxSliceValue?: number;
  minOptimalInfluence?: number;
  minOptimalResources?: number;

  safePathToMecatol: number;
  centerTileNotEmpty: number;
  highQualityAdjacent: number;
  minAlphaWormholes: number;
  minBetaWormholes: number;
  minLegendaries: number;
  maxLegendaries?: number;
  entropicScarValue: number;
}

export const DEFAULT_MILTYEQ_SETTINGS: MiltyEqDraftSettings = {
  minSliceValue: 6,
  maxSliceValue: 10,
  minOptimalInfluence: 3,
  minOptimalResources: 2,
  safePathToMecatol: 0,
  centerTileNotEmpty: 0,
  highQualityAdjacent: 0,
  minAlphaWormholes: 2,
  minBetaWormholes: 2,
  minLegendaries: 1,
  maxLegendaries: 3,
  entropicScarValue: 2,
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

  const handleMinLegendariesChange = (
    property: keyof MiltyEqDraftSettings,
    value: number | undefined,
  ) => {
    handleSettingChange(property, value);
    if (
      value !== undefined &&
      localSettings.maxLegendaries !== undefined &&
      localSettings.maxLegendaries < value
    ) {
      handleSettingChange("maxLegendaries", value);
    }
  };

  const handleMaxLegendariesChange = (
    property: keyof MiltyEqDraftSettings,
    value: number | undefined,
  ) => {
    const constrainedValue =
      value !== undefined && value < localSettings.minLegendaries
        ? localSettings.minLegendaries
        : value;
    handleSettingChange(property, constrainedValue);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_MILTYEQ_SETTINGS);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} style={{ fontFamily: "Orbitron", letterSpacing: "0.05em" }}>
          Milty EQ Settings
        </Text>
      }
      size="lg"
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <SettingsSection title="Slice Value" icon={<IconChartBar size={12} />}>
          <CompactSetting
            label="Min Optimal Influence"
            property="minOptimalInfluence"
            value={localSettings.minOptimalInfluence}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={DEFAULT_MILTYEQ_SETTINGS.minOptimalInfluence}
          />
          <CompactSetting
            label="Min Optimal Resources"
            property="minOptimalResources"
            value={localSettings.minOptimalResources}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={DEFAULT_MILTYEQ_SETTINGS.minOptimalResources}
          />
          <CompactSetting
            label="Min Slice Value"
            property="minSliceValue"
            value={localSettings.minSliceValue}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={DEFAULT_MILTYEQ_SETTINGS.minSliceValue}
          />
          <CompactSetting
            label="Max Slice Value"
            property="maxSliceValue"
            value={localSettings.maxSliceValue}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={DEFAULT_MILTYEQ_SETTINGS.maxSliceValue}
          />
        </SettingsSection>

        <SettingsSection title="Slice Quality" icon={<IconRoute size={12} />}>
          <CompactSetting
            label="Safe Path to Mecatol"
            description="Slices with clear path to center"
            property="safePathToMecatol"
            value={localSettings.safePathToMecatol}
            onChange={handleSettingChange}
          />
          <CompactSetting
            label="High-Quality Adjacent"
            description="Slices with good tiles adjacent to home"
            property="highQualityAdjacent"
            value={localSettings.highQualityAdjacent}
            onChange={handleSettingChange}
          />
          <CompactSetting
            label="Safe Center Tile"
            description="Slices with no empty/anomaly center"
            property="centerTileNotEmpty"
            value={localSettings.centerTileNotEmpty}
            onChange={handleSettingChange}
          />
        </SettingsSection>

        <SettingsSection title="Wormholes & Legendaries" icon={<IconAlien size={12} />}>
          <CompactSetting
            label="Min Alpha Wormholes"
            property="minAlphaWormholes"
            value={localSettings.minAlphaWormholes}
            onChange={handleSettingChange}
          />
          <CompactSetting
            label="Min Beta Wormholes"
            property="minBetaWormholes"
            value={localSettings.minBetaWormholes}
            onChange={handleSettingChange}
          />
          <CompactSetting
            label="Min Legendary Planets"
            property="minLegendaries"
            value={localSettings.minLegendaries}
            onChange={handleMinLegendariesChange}
          />
          <CompactSetting
            label="Max Legendary Planets"
            property="maxLegendaries"
            value={localSettings.maxLegendaries}
            onChange={handleMaxLegendariesChange}
            allowUndefined={true}
            defaultValue={DEFAULT_MILTYEQ_SETTINGS.maxLegendaries}
            minValue={localSettings.minLegendaries}
          />
        </SettingsSection>

        <SettingsSection title="Scoring" icon={<IconSettings size={12} />}>
          <CompactSetting
            label="Entropic Scar Value"
            description="Value for entropic scar systems"
            property="entropicScarValue"
            value={localSettings.entropicScarValue}
            onChange={handleSettingChange}
          />
        </SettingsSection>
      </SimpleGrid>

      <Group justify="space-between" mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
        <Text
          size="xs"
          c="dimmed"
          style={{ cursor: "pointer" }}
          onClick={handleReset}
        >
          Reset to defaults
        </Text>
        <Group gap="xs">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setLocalSettings(settings);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
          >
            Save
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}
