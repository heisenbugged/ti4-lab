import { Group, Text } from "@mantine/core";
import { playerColors } from "~/data/factionData";
import { HydratedPlayer, PRIORITY_PHASE, HOME_PHASE } from "~/types";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

import classes from "~/components/Surface.module.css";
import draftClasses from "./DraftOrder.module.css";

type Props = {
  pickOrder: number[];
  currentPick: number;
  players: HydratedPlayer[];
};

export function DraftOrder({ pickOrder, currentPick, players }: Props) {
  return (
    <Group gap={1}>
      {pickOrder.map((playerId, idx) => {
        if (playerId === PRIORITY_PHASE || playerId === HOME_PHASE) {
          return null;
        }

        const player = players.find(({ id }) => id === playerId);
        if (!player) return null;

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
            data-active={active ? "true" : undefined}
          >
            {player.hasDiscord && <IconBrandDiscordFilled size={14} />}
            <Text ff="heading" size="sm" fw={"bold"} lh={1}>
              {player.name}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
}
