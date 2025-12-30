import { Box, Checkbox, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBox, IconHexagons, IconAlien } from "@tabler/icons-react";
import { useDraftSetup } from "../store";

type ContentRowProps = {
  label: string;
  tilesChecked: boolean;
  factionsChecked: boolean;
  onTilesChange: (checked: boolean) => void;
  onFactionsChange: (checked: boolean) => void;
  dimmed?: boolean;
};

function ContentRow({
  label,
  tilesChecked,
  factionsChecked,
  onTilesChange,
  onFactionsChange,
}: ContentRowProps) {
  return (
    <Group
      gap="xs"
      py={6}
      px="xs"
      wrap="nowrap"
      style={{
        borderBottom: "1px dashed var(--mantine-color-default-border)",
      }}
    >
      <Text
        size="xs"
        fw={500}
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {label}
      </Text>
      <Group gap="md" wrap="nowrap">
        <Checkbox
          size="xs"
          label={
            <Group gap={4}>
              <IconHexagons size={12} />
              <Text size="xs" c="dimmed">
                Tiles
              </Text>
            </Group>
          }
          checked={tilesChecked}
          onChange={(e) => onTilesChange(e.currentTarget.checked)}
          styles={{
            label: { paddingLeft: 6, cursor: "pointer" },
            input: { cursor: "pointer" },
          }}
        />
        <Checkbox
          size="xs"
          label={
            <Group gap={4}>
              <IconAlien size={12} />
              <Text size="xs" c="dimmed">
                Factions
              </Text>
            </Group>
          }
          checked={factionsChecked}
          onChange={(e) => onFactionsChange(e.currentTarget.checked)}
          styles={{
            label: { paddingLeft: 6, cursor: "pointer" },
            input: { cursor: "pointer" },
          }}
        />
      </Group>
    </Group>
  );
}

export function ContentPacksSection() {
  const content = useDraftSetup((state) => state.content);
  const {
    withBaseTiles,
    withBaseFactions,
    withPokTiles,
    withPokFactions,
    withTETiles,
    withTEFactions,
    withDiscordantTiles,
    withDiscordantFactions,
  } = content.flags;

  return (
    <Box
      p="xs"
      style={{
        borderRadius: 4,
        background: "var(--mantine-color-default)",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {/* Header */}
      <Group
        gap="xs"
        pb={6}
        mb="xs"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <ThemeIcon size="sm" variant="light" color="cyan" radius="sm">
          <IconBox size={12} />
        </ThemeIcon>
        <Text
          size="xs"
          fw={600}
          tt="uppercase"
          c="dimmed"
          style={{
            letterSpacing: "0.08em",
            fontFamily: "Orbitron",
            flex: 1,
          }}
        >
          Content Packs
        </Text>
      </Group>

      {/* Content rows */}
      <Stack gap={0}>
        <ContentRow
          label="Base Game"
          tilesChecked={withBaseTiles}
          factionsChecked={withBaseFactions}
          onTilesChange={content.setWithBaseTiles}
          onFactionsChange={content.setWithBaseFactions}
        />
        <ContentRow
          label="Prophecy of Kings"
          tilesChecked={withPokTiles}
          factionsChecked={withPokFactions}
          onTilesChange={content.setWithPokTiles}
          onFactionsChange={content.setWithPokFactions}
        />
        <ContentRow
          label="Thunder's Edge"
          tilesChecked={withTETiles}
          factionsChecked={withTEFactions}
          onTilesChange={content.setWithTETiles}
          onFactionsChange={content.setWithTEFactions}
        />
        <ContentRow
          label="Discordant Stars"
          tilesChecked={withDiscordantTiles}
          factionsChecked={withDiscordantFactions}
          onTilesChange={content.setWithDiscordantTiles}
          onFactionsChange={content.setWithDiscordantFactions}
        />
      </Stack>
    </Box>
  );
}
