import { Checkbox, Group, Text, Title } from "@mantine/core";
import { Faction } from "~/types";

import { FactionIcon } from "~/components/icons/FactionIcon";

type Props = {
  faction: Faction;
  checked: boolean;
  onCheck: (checked: boolean) => void;
};

export function NewDraftFaction({ faction, checked, onCheck }: Props) {
  return (
    <Group
      gap="xs"
      bg="gray.1"
      align="center"
      px="sm"
      py={4}
      style={{
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        flexWrap: "nowrap",
        cursor: "pointer",
      }}
      onMouseDown={() => onCheck(!checked)}
    >
      <FactionIcon faction={faction.id} style={{ width: 30 }} />
      <Text flex={1} lh={1}>
        {faction.name}
      </Text>
      <Checkbox
        radius="xl"
        size="md"
        checked={checked}
        onChange={() => onCheck(!checked)}
      />
    </Group>
  );
}
