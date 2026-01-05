import { Stack, Text } from "@mantine/core";
import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { playerColors } from "~/data/factionData";
import { useRawDraft } from "~/rawDraftStore";
import classes from "~/routes/draft.$id/components/CurrentPickBanner.module.css";

type Props = {
  title?: string;
};

export function RawCurrentPickBanner({ title }: Props) {
  const activePlayer = useRawDraft((state) => state.getActivePlayer());

  if (!activePlayer) {
    return null;
  }

  const playerColor = playerColors[activePlayer.id];

  return (
    <Stack
      gap={8}
      h="60px"
      align="center"
      justify="center"
      className={`${classes.banner} ${classes[playerColor]}`}
      style={{
        left: 250,
      }}
    >
      <Text
        className={`${classes.subtext} ${classes[playerColor]}`}
        px="lg"
        size="sm"
      >
        {/* No lastEvent for raw draft */}
      </Text>
      <AnimatedText
        text={title ?? `It's ${activePlayer.name}'s turn to pick!`}
      />
    </Stack>
  );
}
