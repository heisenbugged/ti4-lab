import { Checkbox, Group, Title } from "@mantine/core";
import { Faction } from "~/types";
import { FactionIcon } from "./features/FactionIcon";
import { useState } from "react";

type Props = {
  faction: Faction;
};

export function NewDraftFaction({ faction }: Props) {
  const [checked, setChecked] = useState(false);
  return (
    <Group
      gap="xs"
      bg="gray.1"
      align="center"
      p="sm"
      style={{
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        flexWrap: "nowrap",
        cursor: "pointer",
      }}
      onMouseDown={() => setChecked((c) => !c)}
    >
      <FactionIcon faction={faction.id} style={{ width: 30 }} />
      <Title order={6} flex={1}>
        {faction.name}
      </Title>
      <Checkbox radius="xl" size="xl" checked={checked} />
    </Group>
  );
}
