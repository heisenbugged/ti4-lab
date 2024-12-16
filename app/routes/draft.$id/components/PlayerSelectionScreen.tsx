import { Button, Grid, Stack, Title } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { playerColors } from "~/data/factionData";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

type Props = {
  onDraftJoined: (playerId: number) => void;
};

const SPECTATOR_ID = -1;

export function PlayerSelectionScreen({ onDraftJoined }: Props) {
  const { hydratedPlayers } = useHydratedDraft();

  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(
    undefined,
  );

  return (
    <Stack flex={1} mih="calc(100vh - 60px)" align="center" justify="center">
      <Title mb="xl">Identify Yourself</Title>
      <Grid w="75vw" maw="1200px" gutter="xl">
        {hydratedPlayers.map((player) => {
          return (
            <Grid.Col key={player.id} span={{ base: 12, sm: 6 }}>
              <Button
                w="100%"
                variant={selectedPlayer === player.id ? "filled" : "outline"}
                size="xl"
                color={playerColors[player.id]}
                onMouseDown={() => setSelectedPlayer(player.id)}
              >
                {player.name}
              </Button>
            </Grid.Col>
          );
        })}
        {/* spectator */}
        <Grid.Col span={12}>
          <Button
            w="100%"
            variant={selectedPlayer === SPECTATOR_ID ? "filled" : "outline"}
            size="xl"
            color="gray"
            onMouseDown={() => setSelectedPlayer(SPECTATOR_ID)}
            leftSection={<IconEye size={24} />}
          >
            Spectator
          </Button>
        </Grid.Col>
      </Grid>
      <Button
        size="xl"
        variant="gradient"
        w="75vw"
        maw="1200px"
        mt="xl"
        disabled={selectedPlayer === undefined}
        onMouseDown={() =>
          selectedPlayer !== undefined && onDraftJoined(selectedPlayer)
        }
      >
        Join Draft
      </Button>
    </Stack>
  );
}
