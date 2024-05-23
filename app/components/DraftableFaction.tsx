import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { Faction, Player } from "~/types";
import { FactionIcon } from "./features/FactionIcon";
import { Titles } from "./Titles";

type Props = {
  faction: Faction;
  player?: Player;
  onSelect?: () => void;
};

export function DraftableFaction({ faction, player, onSelect }: Props) {
  return (
    <Stack
      gap="md"
      bg="gray.1"
      p="sm"
      style={{
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        flexWrap: "nowrap",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <Group
        align="center"
        flex={1}
        style={{
          filter: player ? "grayscale(1)" : "none",
        }}
      >
        <FactionIcon faction={faction.id} style={{ width: 30 }} />
        <Title order={6} flex={1} size={14}>
          {faction.name}
        </Title>
      </Group>

      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
        }}
      >
        {player && (
          <Box bg="gray.4" px={8} py={2} style={{ borderRadius: 8 }}>
            <Text size="xs" tt="uppercase" c="purple" fw={600}>
              {player.name}
            </Text>
            {/* <Titles.Player>{player.name}</Titles.Player> */}
          </Box>
        )}
        {!player && onSelect && (
          <Button size="xs" onMouseDown={onSelect}>
            Choose
          </Button>
        )}
      </div>
    </Stack>
  );
}
