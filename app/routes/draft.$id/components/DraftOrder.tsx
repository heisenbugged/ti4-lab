import { Box, Group, Text } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

import classes from "~/components/Surface.module.css";
import draftClasses from "./DraftOrder.module.css";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

type Props = {
  pickOrder: number[];
  currentPick: number;
  players: Player[];
};

export function DraftOrder({ pickOrder, currentPick, players }: Props) {
  return (
    <Group gap={1}>
      {pickOrder.map((playerId, idx) => {
        const player = players.find(({ id }) => id === playerId)!;
        const alreadyPassed = idx < currentPick;
        const active = idx === currentPick;
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
            {player.discordMemberId && <IconBrandDiscordFilled size={14} />}
            <Text ff="heading" size="sm" fw={"bold"} lh={1}>
              {player.name}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
}
