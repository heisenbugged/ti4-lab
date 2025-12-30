import { ActionIcon, Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight, IconSettings } from "@tabler/icons-react";
import { MAPS, ChoosableDraftType } from "../maps";

type Props = {
  playerCount: number;
  selectedMapType: ChoosableDraftType;
  onMapTypeHover: (mapType: ChoosableDraftType | undefined) => void;
  onMapTypeSelect: (mapType: ChoosableDraftType) => void;
  onOpenMiltySettings: () => void;
  onOpenMiltyEqSettings: () => void;
  onOpenMinorFactionsInfo: () => void;
};

export function MapStyleSelector({
  playerCount,
  selectedMapType,
  onMapTypeHover,
  onMapTypeSelect,
  onOpenMiltySettings,
  onOpenMiltyEqSettings,
  onOpenMinorFactionsInfo,
}: Props) {
  const settingsOpeners: Partial<Record<ChoosableDraftType, () => void>> = {
    milty: onOpenMiltySettings,
    miltyeq: onOpenMiltyEqSettings,
  };

  return (
    <Stack
      gap={4}
      onMouseLeave={() => onMapTypeHover(undefined)}
      mt="xs"
      miw={180}
    >
      {Object.entries(MAPS).map(([type, { title, playerCount: mapPlayerCount }]) => {
        if (mapPlayerCount !== playerCount) return null;

        const isSelected = selectedMapType === type;
        const openSettings = settingsOpeners[type as ChoosableDraftType];

        return (
          <Group key={type} gap={4} wrap="nowrap">
            <UnstyledButton
              onMouseOver={() => onMapTypeHover(type as ChoosableDraftType)}
              onMouseDown={() => onMapTypeSelect(type as ChoosableDraftType)}
              style={{ flex: 1 }}
            >
              <Group
                gap="xs"
                py={6}
                px="sm"
                wrap="nowrap"
                style={{
                  borderRadius: 4,
                  border: isSelected
                    ? "1px solid var(--mantine-color-blue-6)"
                    : "1px solid var(--mantine-color-default-border)",
                  background: isSelected
                    ? "var(--mantine-color-blue-light)"
                    : "var(--mantine-color-default)",
                  transition: "all 100ms ease",
                }}
              >
                <Box
                  w={3}
                  h={16}
                  style={{
                    borderRadius: 1,
                    background: isSelected
                      ? "var(--mantine-color-blue-6)"
                      : "var(--mantine-color-dimmed)",
                    opacity: isSelected ? 1 : 0.3,
                    transition: "all 100ms ease",
                  }}
                />
                <Text
                  size="xs"
                  fw={isSelected ? 600 : 500}
                  style={{
                    flex: 1,
                    fontFamily: "Orbitron",
                    letterSpacing: "0.03em",
                  }}
                >
                  {title}
                </Text>
                <IconChevronRight
                  size={12}
                  style={{
                    opacity: isSelected ? 0.7 : 0.3,
                    transition: "opacity 100ms ease",
                  }}
                />
              </Group>
            </UnstyledButton>
            {openSettings && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onMapTypeSelect(type as ChoosableDraftType);
                  openSettings();
                }}
              >
                <IconSettings size={14} />
              </ActionIcon>
            )}
          </Group>
        );
      })}

      {/* Minor Factions Info Link */}
      <UnstyledButton onMouseDown={onOpenMinorFactionsInfo}>
        <Group
          gap="xs"
          py={4}
          px="sm"
          mt="xs"
          style={{
            borderTop: "1px dashed var(--mantine-color-default-border)",
          }}
        >
          <Text size="xs" c="orange.5" fw={500}>
            Minor Factions Info
          </Text>
          <IconChevronRight size={10} color="var(--mantine-color-orange-5)" />
        </Group>
      </UnstyledButton>
    </Stack>
  );
}
