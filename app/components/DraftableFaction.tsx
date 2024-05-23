import { Button, Group, Stack, Title } from "@mantine/core";
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
      }}
    >
      <Group align="center" flex={1}>
        <FactionIcon faction={faction.id} style={{ width: 30 }} />
        <Title order={6} flex={1} size={14}>
          {faction.name}
        </Title>
      </Group>
      {player && <Titles.Player>{player.name}</Titles.Player>}
      {!player && onSelect && <Button onMouseDown={onSelect}>Choose</Button>}
    </Stack>
  );
}
