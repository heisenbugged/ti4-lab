import { Button, Stack, Text } from "@mantine/core";
import { Player } from "~/types";
import { PlayerChip } from "./PlayerChip";

import classes from "~/components/Surface.module.css";

type Props = {
  speakerOrder: string;
  player?: Player;
  canSelectSpeakerOrder: boolean;
  onSelect: () => void;
};

export function DraftableSpeakerOrder({
  speakerOrder,
  player,
  canSelectSpeakerOrder,
  onSelect,
}: Props) {
  return (
    <Stack
      key={speakerOrder}
      align="center"
      p="sm"
      style={{
        borderRadius: "var(--mantine-radius-md)",
      }}
      className={`${classes.surface} ${classes.withBorder}`}
      pos="relative"
      gap={6}
      justify="stretch"
    >
      <Text ff="heading" fw="bold">
        {speakerOrder}
      </Text>
      {!player && canSelectSpeakerOrder && (
        <Button size="compact-sm" px="lg" onMouseDown={onSelect}>
          Select
        </Button>
      )}
      {player && <PlayerChip player={player} />}
    </Stack>
  );
}
