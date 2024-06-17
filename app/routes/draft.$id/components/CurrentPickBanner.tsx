import { Stack, Text } from "@mantine/core";
import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { playerColors } from "~/data/factionData";

import classes from "./CurrentPickBanner.module.css";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

export function CurrentPickBanner() {
  const { activePlayer, lastEvent } = useHydratedDraft();
  const playerColor = playerColors[activePlayer.id];
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
      <AnimatedText text={`It's ${activePlayer?.name}'s turn to pick!`} />
    </Stack>
  );
}
