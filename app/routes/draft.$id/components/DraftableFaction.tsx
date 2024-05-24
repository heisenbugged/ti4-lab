import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, Player } from "~/types";
import { PlayerChip } from "./PlayerChip";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";

type Props = {
  faction: Faction;
  player?: Player;
  onSelect?: () => void;
  applyGreyscale?: boolean;
};

export function DraftableFaction({
  faction,
  player,
  applyGreyscale = true,
  onSelect,
}: Props) {
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
        style={{ filter: player && applyGreyscale ? "grayscale(1)" : "none" }}
        pt={10}
      >
        <FactionIcon faction={faction.id} style={{ width: 30 }} />
        <Title order={6} flex={1} size={14} lh={1}>
          {faction.name}
        </Title>
      </Group>

      <PlayerChipOrSelect player={player} onSelect={onSelect} />
    </Stack>
  );
}
