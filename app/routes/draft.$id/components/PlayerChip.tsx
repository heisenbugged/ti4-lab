import { Badge, Box, MantineSize } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";
import classes from "./PlayerChip.module.css";

type Props = {
  player: Player;
  size?: "sm" | "md" | "lg" | "xl";
  visibleFrom?: MantineSize;
  hiddenFrom?: MantineSize;
  /** Use compact mode for very tight spaces - clips text without ellipsis */
  compact?: boolean;
  color?: string;
};

export function PlayerChip({
  player,
  size = "md",
  visibleFrom,
  hiddenFrom,
  compact = false,
  color,
}: Props) {
  const playerColor = color || playerColors[player.id];

  // Compact mode: show clipped text without ellipsis, allows slight overflow
  if (compact) {
    return (
      <Box
        className={classes.compactChip}
        visibleFrom={visibleFrom}
        hiddenFrom={hiddenFrom}
        data-color={playerColor}
        style={{
          ["--chip-color" as string]: `var(--mantine-color-${playerColor}-filled)`,
          ["--chip-color-light" as string]: `var(--mantine-color-${playerColor}-light)`,
        }}
      >
        <span className={classes.compactText}>{player.name}</span>
      </Box>
    );
  }

  return (
    <Badge
      color={playerColor}
      size={size}
      visibleFrom={visibleFrom}
      hiddenFrom={hiddenFrom}
    >
      {player.name}
    </Badge>
  );
}
