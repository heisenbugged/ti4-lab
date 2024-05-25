import { Badge, Chip } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  player: Player;
  size?: "sm" | "md" | "lg";
};

export function PlayerChip({ player, size = "md" }: Props) {
  return (
    <Badge color={playerColors[player.id]} size={size}>
      {player.name}
    </Badge>
  );
}
