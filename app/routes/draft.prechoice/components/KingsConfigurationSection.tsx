import { Box, Button, Group, Text } from "@mantine/core";
import { IconCrown } from "@tabler/icons-react";
import { ConfigSection } from "~/components/ConfigSection";
import { useDraftSetup } from "../store";

export function KingsConfigurationSection() {
  const kings = useDraftSetup((state) => state.kings);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <ConfigSection title="Kings" icon={<IconCrown size={12} />}>
      <Box py={6} style={{ borderBottom: "1px dashed var(--mantine-color-default-border)" }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>Kings in Pool</Text>
            <Text size="xs" c="dimmed">Mahact kings available for drafting</Text>
          </Box>
          <Group gap={2}>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={kings.numKings <= playerCount}
              onMouseDown={() => kings.setNumKings(kings.numKings - 1)}
            >
              -
            </Button>
            <Text size="sm" fw={600} miw={24} ta="center" c="purple.3">
              {kings.numKings}
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={kings.numKings >= 8}
              onMouseDown={() => kings.setNumKings(kings.numKings + 1)}
            >
              +
            </Button>
          </Group>
        </Group>
      </Box>
    </ConfigSection>
  );
}
