import { Stack, Text, useMantineTheme } from "@mantine/core";
import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  player: Player;
  lastEvent?: string;
};

export function CurrentPickBanner({ player, lastEvent }: Props) {
  const { colors } = useMantineTheme();

  const playerColor = colors[playerColors[player.id - 1]];
  return (
    <Stack
      gap={8}
      h="80px"
      align="center"
      justify="center"
      style={{
        transition:
          "background-color 500ms ease-in-out, border-color 500ms ease-in-out",
        position: "fixed",
        top: 60,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: playerColor[3],
        borderBottom: `4px solid ${playerColor[5]}`,
        borderColor: playerColor[5],
      }}
    >
      <Text
        c="white"
        fw="bold"
        style={{
          fontStyle: "italic",
          borderRadius: 8,
          transition: "background-color 500ms ease-in-out",
        }}
        bg={playerColor[9]}
        px="lg"
        size="sm"
      >
        {lastEvent ?? ""}
      </Text>
      <AnimatedText
        text={`It's ${player?.name}'s turn to pick!`}
        color="black"
      />
    </Stack>
  );
}
