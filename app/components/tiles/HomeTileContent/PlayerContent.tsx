import { Stack } from "@mantine/core";
import type { FactionId, Player } from "~/types";
import { FactionIcon } from "../../icons/FactionIcon";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";

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

  return (
    <Stack
      align="center"
      gap={1}
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
      <PlayerChip player={player} compact />
    </Stack>
  );
}
