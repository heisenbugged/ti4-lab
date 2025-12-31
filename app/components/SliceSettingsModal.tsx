import { useState, useEffect } from "react";
import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Text,
  NumberInput,
  Box,
  Stack,
  Tooltip,
} from "@mantine/core";
import { CompactSetting } from "~/components/CompactSetting";
import { SettingsSection } from "~/components/SettingsSection";
import { IconChartBar, IconRoute, IconAlien } from "@tabler/icons-react";
import { DEFAULT_SLICE_VALUE_MODIFIERS } from "~/stats";

export type SliceSettingsFormatType = "milty" | "miltyeq" | "heisen";

export interface SliceGenerationSettings {
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

  // Slice value modifiers
  entropicScarValue: number;
  techValue: number;
  hopesEndValue: number;
  emelparValue: number;
  industrexValue: number;
  otherLegendaryValue: number;
  tradeStationValue: number;
  equidistantMultiplier: number;
  supernovaOnPathPenalty: number;
  nebulaOnPathPenalty: number;
}

export const DEFAULT_SLICE_SETTINGS: Record<
  SliceSettingsFormatType,
  SliceGenerationSettings
> = {
  milty: {
    minOptimalInfluence: 4,
    minOptimalResources: 3,
    minSliceValue: 9,
    maxSliceValue: 13,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 2,
    minBetaWormholes: 2,
    minLegendaries: 1,
    maxLegendaries: 3,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
  miltyeq: {
    minOptimalInfluence: 3,
    minOptimalResources: 2,
    minSliceValue: 6,
    maxSliceValue: 10,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 2,
    minBetaWormholes: 2,
    minLegendaries: 1,
    maxLegendaries: 3,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
  heisen: {
    minOptimalInfluence: 0,
    minOptimalResources: 0,
    minSliceValue: 4,
    maxSliceValue: 10,
    safePathToMecatol: 0,
    centerTileNotEmpty: 0,
    highQualityAdjacent: 0,
    minAlphaWormholes: 0,
    minBetaWormholes: 0,
    minLegendaries: 0,
    maxLegendaries: undefined,
    ...DEFAULT_SLICE_VALUE_MODIFIERS,
  },
};

// Fields to disable (hide) per format type
const DISABLED_FIELDS: Record<
  SliceSettingsFormatType,
  (keyof SliceGenerationSettings)[]
> = {
  milty: [],
  miltyeq: [],
  heisen: [
    // Slice Quality - nucleus has different generation
    "safePathToMecatol",
    "centerTileNotEmpty",
    "highQualityAdjacent",
    // Wormholes & Legendaries - nucleus uses weighted distribution
    "minAlphaWormholes",
    "minBetaWormholes",
    "minLegendaries",
    "maxLegendaries",
  ],
};

const FORMAT_TITLES: Record<SliceSettingsFormatType, string> = {
  milty: "Milty Draft Settings",
  miltyeq: "Milty EQ Settings",
  heisen: "Nucleus Settings",
};

type Props = {
  opened: boolean;
  formatType: SliceSettingsFormatType;
  settings: SliceGenerationSettings;
  onClose: () => void;
  onSave: (newSettings: SliceGenerationSettings) => void;
};

// Compact inline decimal input for slice value modifiers
function InlineDecimal({
  label,
  tooltip,
  value,
  onChange,
  step = 0.5,
  min,
  max,
}: {
  label: string;
  tooltip?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const labelElement = (
    <Text
      size="xs"
      style={{
        whiteSpace: "nowrap",
        ...(tooltip && {
          cursor: "help",
          borderBottom: "1px dotted var(--mantine-color-dimmed)",
        }),
      }}
    >
      {label}
    </Text>
  );

  return (
    <Group gap={6} wrap="nowrap" justify="space-between">
      {tooltip ? (
        <Tooltip label={tooltip} multiline maw={250} withArrow>
          {labelElement}
        </Tooltip>
      ) : (
        labelElement
      )}
      <NumberInput
        value={value}
        onChange={(val) => onChange(typeof val === "number" ? val : 0)}
        step={step}
        min={min}
        max={max}
        decimalScale={2}
        fixedDecimalScale={false}
        w={62}
        size="xs"
        styles={{
          input: {
            textAlign: "center",
            fontWeight: 600,
            paddingLeft: 4,
            paddingRight: 22,
          },
        }}
      />
    </Group>
  );
}

export function SliceSettingsModal({
  opened,
  formatType,
  onClose,
  settings,
  onSave,
}: Props) {
  const [localSettings, setLocalSettings] =
    useState<SliceGenerationSettings>(settings);

  // Sync local state when settings or formatType changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, formatType]);

  const defaults = DEFAULT_SLICE_SETTINGS[formatType];
  const disabledFields = DISABLED_FIELDS[formatType];
  const isDisabled = (field: keyof SliceGenerationSettings) =>
    disabledFields.includes(field);

  const handleSettingChange = (
    property: keyof SliceGenerationSettings,
    value: number | undefined,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleMinLegendariesChange = (
    property: keyof SliceGenerationSettings,
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
    property: keyof SliceGenerationSettings,
    value: number | undefined,
  ) => {
    const constrainedValue =
      value !== undefined && value < localSettings.minLegendaries
        ? localSettings.minLegendaries
        : value;
    handleSettingChange(property, constrainedValue);
  };

  const handleReset = () => {
    setLocalSettings(defaults);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text
          fw={700}
          style={{ fontFamily: "Orbitron", letterSpacing: "0.05em" }}
        >
          {FORMAT_TITLES[formatType]}
        </Text>
      }
      size="xl"
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <SettingsSection
          title="Slice Balance"
          icon={<IconChartBar size={12} />}
        >
          <CompactSetting
            label="Min Optimal Influence"
            property="minOptimalInfluence"
            value={localSettings.minOptimalInfluence}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={defaults.minOptimalInfluence}
          />
          <CompactSetting
            label="Min Optimal Resources"
            property="minOptimalResources"
            value={localSettings.minOptimalResources}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={defaults.minOptimalResources}
          />
          <CompactSetting
            label="Min Slice Value"
            property="minSliceValue"
            value={localSettings.minSliceValue}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={defaults.minSliceValue}
          />
          <CompactSetting
            label="Max Slice Value"
            property="maxSliceValue"
            value={localSettings.maxSliceValue}
            onChange={handleSettingChange}
            allowUndefined={true}
            defaultValue={defaults.maxSliceValue}
          />
        </SettingsSection>

        <SettingsSection title="Slice Value" icon={<IconChartBar size={12} />}>
          <Stack gap="xs">
            {/* Special Features */}
            <Box>
              <Text size="10px" c="dimmed" tt="uppercase" mb={4} opacity={0.7}>
                Features
              </Text>
              <SimpleGrid cols={2} spacing={6}>
                <InlineDecimal
                  label="Tech Skip"
                  tooltip="Bonus value added for each tech specialty (red/blue/green/yellow skip) on a planet"
                  value={localSettings.techValue}
                  onChange={(v) => handleSettingChange("techValue", v)}
                  step={0.25}
                />
                <InlineDecimal
                  label="Trade Station"
                  tooltip="Bonus value added for trade station planets"
                  value={localSettings.tradeStationValue}
                  onChange={(v) => handleSettingChange("tradeStationValue", v)}
                />
                <InlineDecimal
                  label="Entropic Scar"
                  tooltip="Bonus value added for systems with the Entropic Scar anomaly"
                  value={localSettings.entropicScarValue}
                  onChange={(v) => handleSettingChange("entropicScarValue", v)}
                />
                <InlineDecimal
                  label="Equidistant Penalty"
                  tooltip="Multiplier applied to equidistant tiles (tiles equally close to multiple home systems). Lower values penalize these tiles more."
                  value={localSettings.equidistantMultiplier}
                  onChange={(v) =>
                    handleSettingChange("equidistantMultiplier", v)
                  }
                  step={0.1}
                  min={0}
                  max={1}
                />
              </SimpleGrid>
            </Box>

            {/* Legendaries */}
            <Box>
              <Text size="10px" c="dimmed" tt="uppercase" mb={4} opacity={0.7}>
                Legendaries
              </Text>
              <SimpleGrid cols={2} spacing={6}>
                <InlineDecimal
                  label="Hope's End"
                  value={localSettings.hopesEndValue}
                  onChange={(v) => handleSettingChange("hopesEndValue", v)}
                />
                <InlineDecimal
                  label="Emelpar"
                  value={localSettings.emelparValue}
                  onChange={(v) => handleSettingChange("emelparValue", v)}
                />
                <InlineDecimal
                  label="Industrex"
                  value={localSettings.industrexValue}
                  onChange={(v) => handleSettingChange("industrexValue", v)}
                />
                <InlineDecimal
                  label="Other Legendary"
                  value={localSettings.otherLegendaryValue}
                  onChange={(v) =>
                    handleSettingChange("otherLegendaryValue", v)
                  }
                />
              </SimpleGrid>
            </Box>

            {/* Path Penalties */}
            <Box>
              <Text size="10px" c="dimmed" tt="uppercase" mb={4} opacity={0.7}>
                Path Penalties
              </Text>
              <SimpleGrid cols={2} spacing={6}>
                <InlineDecimal
                  label="Supernova"
                  tooltip="Penalty applied when a supernova blocks the direct path to Mecatol Rex"
                  value={localSettings.supernovaOnPathPenalty}
                  onChange={(v) =>
                    handleSettingChange("supernovaOnPathPenalty", v)
                  }
                />
                <InlineDecimal
                  label="Nebula"
                  tooltip="Penalty applied when a nebula is on the direct path to Mecatol Rex"
                  value={localSettings.nebulaOnPathPenalty}
                  onChange={(v) =>
                    handleSettingChange("nebulaOnPathPenalty", v)
                  }
                />
              </SimpleGrid>
            </Box>
          </Stack>
        </SettingsSection>

        {!isDisabled("safePathToMecatol") && (
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
        )}

        {!isDisabled("minAlphaWormholes") && (
          <SettingsSection
            title="Wormholes & Legendaries"
            icon={<IconAlien size={12} />}
          >
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
              defaultValue={defaults.maxLegendaries}
              minValue={localSettings.minLegendaries}
            />
          </SettingsSection>
        )}
      </SimpleGrid>

      <Group
        justify="space-between"
        mt="md"
        pt="md"
        style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      >
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
