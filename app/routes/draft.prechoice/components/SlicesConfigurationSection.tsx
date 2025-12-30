import { Box, Button, Group, Text } from "@mantine/core";
import { IconHexagons } from "@tabler/icons-react";
import { ConfigSection } from "~/components/ConfigSection";
import { useDraftSetup } from "../store";

export function SlicesConfigurationSection() {
  const slices = useDraftSetup((state) => state.slices);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <ConfigSection title="Slices" icon={<IconHexagons size={12} />}>
      <Box py={6} style={{ borderBottom: "1px dashed var(--mantine-color-default-border)" }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>Slices in Pool</Text>
            <Text size="xs" c="dimmed">Available slices for the draft</Text>
          </Box>
          <Group gap={2}>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={slices.numSlices <= playerCount}
              onMouseDown={() => slices.setNumSlices(slices.numSlices - 1)}
            >
              -
            </Button>
            <Text size="sm" fw={600} miw={24} ta="center" c="purple.3">
              {slices.numSlices}
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={slices.numSlices >= 9}
              onMouseDown={() => slices.setNumSlices(slices.numSlices + 1)}
            >
              +
            </Button>
          </Group>
        </Group>
      </Box>
    </ConfigSection>
  );
}
