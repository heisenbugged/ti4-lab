import { Box, Group, Text } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { DiscordPlayer, Player } from "~/types";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

import classes from "~/components/Surface.module.css";
import draftClasses from "./DraftOrder.module.css";

type Props = {
  pickOrder: number[];
  currentPick: number;
  players: Player[];
  discordPlayers: DiscordPlayer[];
};

export function DraftOrder({
  pickOrder,
  currentPick,
  players,
  discordPlayers,
}: Props) {
  return (
    <Group gap={1}>
      {pickOrder.map((playerId, idx) => {
        const player = players.find(({ id }) => id === playerId)!;
        const alreadyPassed = idx < currentPick;
        const active = idx === currentPick;
        const discordPlayer = discordPlayers.find(
          (p) => p.playerId === player.id,
        );
        const discordMember =
          discordPlayer?.type === "identified" ? discordPlayer : undefined;

        return (
          <Group
            key={idx}
            className={[
              classes.surface,
              draftClasses[playerColors[player.id]],
              active ? draftClasses.active : "",
              alreadyPassed ? draftClasses.passed : "",
            ].join(" ")}
            p="xs"
            gap="xs"
          >
            {discordMember?.memberId && <IconBrandDiscordFilled size={14} />}
            <Text ff="heading" size="sm" fw={"bold"} lh={1}>
              {discordMember?.nickname ??
                discordMember?.username ??
                player.name}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
}
