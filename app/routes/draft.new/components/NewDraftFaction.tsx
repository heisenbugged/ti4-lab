import { ActionIcon, Box, Checkbox, Group, Text } from "@mantine/core";
import { Faction } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { IconX } from "@tabler/icons-react";

import classes from "./NewDraftFaction.module.css";

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
  const isSelectable = !!onCheck;

  return (
    <Group
      gap="xs"
      className={classes.factionCard}
      data-selectable={isSelectable || undefined}
      align="center"
      px="sm"
      py={6}
      wrap="nowrap"
      style={{ cursor: isSelectable ? "pointer" : undefined }}
      onMouseDown={isSelectable ? () => onCheck(!checked) : undefined}
    >
      <Box className={classes.indicator} />
      <FactionIcon
        faction={faction.id}
        style={{ minWidth: 28, maxWidth: 28 }}
      />
      <Text size="sm" flex={1} lh={1.2} truncate>
        {faction.name}
      </Text>
      {onRemove && (
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          className={classes.removeButton}
          onMouseDown={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={!removeEnabled}
        >
          <IconX size={12} />
        </ActionIcon>
      )}
      {onCheck && (
        <Checkbox
          radius="xl"
          size="sm"
          checked={checked}
          onChange={() => onCheck(!checked)}
        />
      )}
    </Group>
  );
}
