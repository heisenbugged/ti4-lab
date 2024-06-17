import { Button, Grid, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { playerColors } from "~/data/factionData";
import { useDraft } from "~/draftStore";
import { Player } from "~/types";

type Props = {
  onDraftJoined: (player: Player) => void;
};
export function PlayerSelectionScreen({ onDraftJoined }: Props) {
  const players = useDraft((state) => state.draft.players);
  const discord = useDraft((state) => state.draft.integrations.discord);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  return (
    <Stack flex={1} mih="calc(100vh - 60px)" align="center" justify="center">
      <Title mb="xl">Identify Thyself!</Title>
      <Grid w="75vw" maw="1200px" gutter="xl">
        {players.map((player) => {
          const discordPlayer = discord?.players.find(
            (discordPlayer) => discordPlayer.playerId === player.id,
          );
          const discordMember =
            discordPlayer?.type === "identified" ? discordPlayer : undefined;
          return (
            <Grid.Col key={player.id} span={{ base: 12, sm: 6 }}>
              <Button
                w="100%"
                variant={selectedPlayer === player ? "filled" : "outline"}
                size="xl"
                color={playerColors[player.id]}
                onMouseDown={() => setSelectedPlayer(player)}
              >
                {discordMember?.nickname ??
                  discordMember?.username ??
                  player.name}
              </Button>
            </Grid.Col>
          );
        })}
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
