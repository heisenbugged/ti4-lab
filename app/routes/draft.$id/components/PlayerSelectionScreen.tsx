import { Button, SimpleGrid, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  players: Player[];
  onDraftJoined: (player: Player) => void;
};
export function PlayerSelectionScreen({ players, onDraftJoined }: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  return (
    <Stack
      flex={1}
      h="calc(100vh - 60px)"
      align="center"
      justify="center"
      bg="white"
    >
      <Title size="48px" mb="xl">
        Identify Thyself!
      </Title>
      <SimpleGrid cols={2} w="75vw" maw="1200px" spacing="xl">
        {players.map((player) => (
          <Button
            key={player.id}
            variant={selectedPlayer === player ? "filled" : "outline"}
            size="xl"
            color={playerColors[player.id]}
            onMouseDown={() => setSelectedPlayer(player)}
          >
            {player.name}
          </Button>
        ))}
      </SimpleGrid>
      <Button
        size="xl"
        variant="gradient"
        w="75vw"
        maw="1200px"
        mt="xl"
        disabled={!selectedPlayer}
        onMouseDown={() => selectedPlayer && onDraftJoined(selectedPlayer)}
      >
        Join Draft
      </Button>
    </Stack>
  );
}
