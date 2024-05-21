import { Group } from "@mantine/core";
import { Faction } from "~/types";
import { FactionIcon } from "./features/FactionIcon";
import { Titles } from "./Titles";

type Props = {
  faction?: Faction;
  name: string;
};

export function PlayerLabel({ faction, name }: Props) {
  return (
    <Group gap="xs" align="center">
      {faction && <FactionIcon faction={faction} style={{ maxHeight: 20 }} />}
      <Titles.Player>{name}</Titles.Player>
    </Group>
  );
}