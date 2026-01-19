import { Box, Stack, Text } from "@mantine/core";
import type { FactionId, Player } from "~/types";
import { FactionIcon } from "../../icons/FactionIcon";
import { playerColors } from "~/data/factionData";
import classes from "../Tiles.module.css";

type PlayerWithFaction = { faction: FactionId } & Player;

type Props = {
  player: Player;
  radius: number;
};

/**
 * Content for home tiles with an assigned player.
 * Shows faction icon and player chip.
 */
export function PlayerContent({ player, radius }: Props) {
  const hasFaction = (p: Player): p is PlayerWithFaction =>
    p != null && "faction" in p && typeof p.faction === "string";

  const playerColor = playerColors[player.id] ?? "gray";
  const nameSize = radius >= 60 ? "xs" : "10px";

  return (
    <Stack
      align="center"
      gap={0}
      w={radius * 1.25}
      justify="center"
      style={{ zIndex: 1 }}
    >
      {hasFaction(player) && (
        <FactionIcon
          faction={player.faction}
          style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
        />
      )}
      <Box
        className={classes.playerNameBadge}
        px={6}
        py={3}
        style={{
          borderRadius: 6,
          maxWidth: radius * 1.15,
        }}
      >
        <Text
          size={nameSize}
          fw={700}
          ta="center"
          c={playerColor}
          lineClamp={2}
        >
          {player.name}
        </Text>
      </Box>
    </Stack>
  );
}
