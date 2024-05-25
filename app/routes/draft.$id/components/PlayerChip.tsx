import { Badge, Chip } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  player: Player;
};

export function PlayerChip({ player }: Props) {
  return <Badge color={playerColors[player.id - 1]}>{player.name}</Badge>;
}
