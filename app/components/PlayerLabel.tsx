import { Group } from "@mantine/core";
import { FactionId } from "~/types";
import { Titles } from "./Titles";
import { FactionIcon } from "./icons/FactionIcon";

type Props = {
  faction?: FactionId;
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
