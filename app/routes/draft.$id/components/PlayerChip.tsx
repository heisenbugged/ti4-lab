import { Badge, MantineSize } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  player: Player;
  size?: "sm" | "md" | "lg" | "xl";
  visibleFrom?: MantineSize;
  hiddenFrom?: MantineSize;
};

export function PlayerChip({
  player,
  size = "md",
  visibleFrom,
  hiddenFrom,
}: Props) {
  return (
    <Badge
      color={playerColors[player.id]}
      size={size}
      visibleFrom={visibleFrom}
      hiddenFrom={hiddenFrom}
    >
      {player.name}
    </Badge>
  );
}
