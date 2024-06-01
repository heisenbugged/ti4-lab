import { Button, Checkbox, Group, Text } from "@mantine/core";
import { Faction } from "~/types";

import { FactionIcon } from "~/components/icons/FactionIcon";
import { IconTrashFilled } from "@tabler/icons-react";

type Props = {
  faction: Faction;
  checked?: boolean;
  removeEnabled?: boolean;
  onCheck?: (checked: boolean) => void;
  onRemove?: () => void;
};

export function NewDraftFaction({
  faction,
  checked,
  removeEnabled = true,
  onCheck,
  onRemove,
}: Props) {
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
      onMouseDown={() => onCheck?.(!checked)}
    >
      <FactionIcon faction={faction.id} style={{ width: 30 }} />
      <Text flex={1} lh={1}>
        {faction.name}
      </Text>
      {onRemove && (
        <Button
          size="compact-xs"
          variant="filled"
          bg={removeEnabled ? "red.9" : "gray.3"}
          onMouseDown={onRemove}
          disabled={!removeEnabled}
        >
          <IconTrashFilled size={16} />
        </Button>
      )}
      {onCheck && (
        <Checkbox
          radius="xl"
          size="md"
          checked={checked}
          onChange={() => onCheck(!checked)}
        />
      )}
    </Group>
  );
}
