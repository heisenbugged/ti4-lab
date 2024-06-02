import { Stack, Text, useMantineTheme } from "@mantine/core";
import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { playerColors } from "~/data/factionData";
import { useIsLight } from "~/hooks/useIsLight";
import { Player } from "~/types";

import classes from "./CurrentPickBanner.module.css";

type Props = {
  player: Player;
  lastEvent?: string;
};

export function CurrentPickBanner({ player, lastEvent }: Props) {
  const playerColor = playerColors[player.id];

  return (
    <Stack
      gap={8}
      h="80px"
      align="center"
      justify="center"
      className={`${classes.banner} ${classes[playerColor]}`}
    >
      <Text
        className={`${classes.subtext} ${classes[playerColor]}`}
        px="lg"
        size="sm"
      >
        {lastEvent ?? ""}
      </Text>
      <AnimatedText text={`It's ${player?.name}'s turn to pick!`} />
    </Stack>
  );
}
