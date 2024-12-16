import { Button, Checkbox, Group, Text } from "@mantine/core";
import { Faction } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { IconTrashFilled } from "@tabler/icons-react";

import surfaceClasses from "~/components/Surface.module.css";
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
  return (
    <Group
      gap="xs"
      className={`${surfaceClasses.surface} ${surfaceClasses.withBorder}`}
      align="center"
      px="sm"
      py={4}
      style={{
        borderRadius: "var(--mantine-radius-lg)",
        flexWrap: "nowrap",
      }}
      onMouseDown={() => onCheck?.(!checked)}
    >
      <FactionIcon
        faction={faction.id}
        style={{ minWidth: 30, maxWidth: 30 }}
      />
      <Text flex={1} lh={1}>
        {faction.name}
      </Text>
      {onRemove && (
        <Button
          size="compact-xs"
          variant="filled"
          className={`${classes["remove-button"]} ${removeEnabled ? "" : classes.withDisabled}`}
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
