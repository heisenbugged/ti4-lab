import { Box, Group, Text } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  pickOrder: number[];
  currentPick: number;
  players: Player[];
};

export function DraftOrder({ pickOrder, currentPick, players }: Props) {
  return (
    <Group gap={1}>
      {pickOrder.map((playerId, idx) => {
        const player = players.find(({ id }) => id === playerId)!!;
        const alreadyPassed = idx < currentPick;
        const active = idx === currentPick;
        return (
          <Box
            key={idx}
            bg={active ? `${playerColors[player.id]}.2` : "gray.2"}
            p="xs"
            style={{
              border: active
                ? `4px solid var(--mantine-color-${playerColors[player.id]}-8)`
                : "none",
            }}
          >
            <Text
              ff="heading"
              size="sm"
              c={alreadyPassed ? "gray.8" : `${playerColors[player.id]}.9`}
              fw={"bold"}
              lh={1}
            >
              {player.name}
            </Text>
          </Box>
        );
      })}
    </Group>
  );
}
