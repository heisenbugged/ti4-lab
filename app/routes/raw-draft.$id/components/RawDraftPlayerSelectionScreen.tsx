import { Button, Grid, Stack, Title, Box } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { playerColors } from "~/data/factionData";
import { useRawDraft } from "~/rawDraftStore";

type Props = {
  onDraftJoined: (playerId: number) => void;
};

const SPECTATOR_ID = -1;

export function RawDraftPlayerSelectionScreen({ onDraftJoined }: Props) {
  const players = useRawDraft((state) => state.state.players);

  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(
    undefined,
  );

  return (
    <Stack
      flex={1}
      mih="calc(100vh - 60px)"
      align="center"
      justify="space-between"
      pb={{ base: 0, xs: "xl" }}
    >
      <Box />
      <Stack align="center" w="100%">
        <Title mb="xl">Identify Yourself</Title>
        <Grid w="75vw" maw="1200px" gutter="xl">
          {players.map((player) => {
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
      </Stack>
      <Box
        w="100%"
        style={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "var(--mantine-color-dark-7)",
          padding: "var(--mantine-spacing-md)",
        }}
        hiddenFrom="xs"
      >
        <Button
          size="xl"
          variant="gradient"
          w="100%"
          disabled={selectedPlayer === undefined}
          onMouseDown={() =>
            selectedPlayer !== undefined && onDraftJoined(selectedPlayer)
          }
        >
          Join Draft
        </Button>
      </Box>
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
        visibleFrom="xs"
      >
        Join Draft
      </Button>
    </Stack>
  );
}
