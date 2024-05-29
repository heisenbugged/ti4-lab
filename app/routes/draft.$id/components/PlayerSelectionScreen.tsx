import { Button, Grid, SimpleGrid, Stack, Title } from "@mantine/core";
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
      <Title mb="xl">Identify Thyself!</Title>
      <Grid w="75vw" maw="1200px" gutter="xl">
        {players.map((player) => (
          <Grid.Col key={player.id} span={{ base: 12, sm: 6 }}>
            <Button
              w="100%"
              variant={selectedPlayer === player ? "filled" : "outline"}
              size="xl"
              color={playerColors[player.id]}
              onMouseDown={() => setSelectedPlayer(player)}
            >
              {player.name}
            </Button>
          </Grid.Col>
        ))}
      </Grid>
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
