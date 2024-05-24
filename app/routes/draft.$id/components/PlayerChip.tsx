import { Group, Text } from "@mantine/core";
import { Player } from "~/types";

type Props = {
  player: Player;
};

export function PlayerChip({ player }: Props) {
  return (
    <Group bg="gray.4" px={8} py={4} style={{ borderRadius: 4 }} gap="xs">
      <img src={`/avatar/avatar${player.id - 1}.png`} style={{ width: 20 }} />
      <Text size="xs" tt="uppercase" c="purple" fw={600}>
        {player.name}
      </Text>
    </Group>
  );
}
