import { Button, Stack, Text } from "@mantine/core";
import { Player } from "~/types";
import { PlayerChip } from "./PlayerChip";

import { playerColors } from "~/data/factionData";
import { Surface, PlayerColor } from "~/ui";

type Props = {
  speakerOrder: string;
  player?: Player;
  canSelectSpeakerOrder: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function DraftableSpeakerOrder({
  speakerOrder,
  player,
  canSelectSpeakerOrder,
  disabled = false,
  onSelect,
}: Props) {
  const playerColor = player ? (playerColors[player.id] as PlayerColor) : undefined;
  return (
    <Surface
      variant="card"
      color={playerColor}
      style={{ opacity: player ? 0.5 : 1 }}
    >
      <Stack
        key={speakerOrder}
        align="center"
        p="sm"
        pos="relative"
        gap={6}
        justify="stretch"
      >
        <Text ff="heading" fw="bold">
          {speakerOrder}
        </Text>
        {!player && canSelectSpeakerOrder && (
          <Button
            size="compact-sm"
            px="lg"
            onMouseDown={onSelect}
            disabled={disabled}
          >
            Select
          </Button>
        )}
        {player && <PlayerChip player={player} />}
      </Stack>
    </Surface>
  );
}
