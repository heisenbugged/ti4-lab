import { Box, Button, Group, Text } from "@mantine/core";
import { IconCards } from "@tabler/icons-react";
import { ConfigSection } from "~/components/ConfigSection";
import { useDraftSetup } from "../store";

export function ReferenceCardPacksConfigurationSection() {
  const referenceCardPacks = useDraftSetup((state) => state.referenceCardPacks);
  const playerCount = useDraftSetup((state) => state.player.players.length);

  return (
    <ConfigSection title="Reference Cards" icon={<IconCards size={12} />} color="orange">
      <Box py={6} style={{ borderBottom: "1px dashed var(--mantine-color-default-border)" }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>Card Packs</Text>
            <Text size="xs" c="dimmed">Each pack has 3 factions (max 10)</Text>
          </Box>
          <Group gap={2}>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={referenceCardPacks.numReferenceCardPacks <= playerCount}
              onMouseDown={() =>
                referenceCardPacks.setNumReferenceCardPacks(
                  referenceCardPacks.numReferenceCardPacks - 1,
                )
              }
            >
              -
            </Button>
            <Text size="sm" fw={600} miw={24} ta="center" c="purple.3">
              {referenceCardPacks.numReferenceCardPacks}
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              disabled={referenceCardPacks.numReferenceCardPacks >= 10}
              onMouseDown={() =>
                referenceCardPacks.setNumReferenceCardPacks(
                  referenceCardPacks.numReferenceCardPacks + 1,
                )
              }
            >
              +
            </Button>
          </Group>
        </Group>
      </Box>
    </ConfigSection>
  );
}
