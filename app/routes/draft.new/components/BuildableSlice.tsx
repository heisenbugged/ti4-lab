import {
  ActionIcon,
  Button,
  Group,
  Popover,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Slice, Tile } from "~/types";
import { IconDice6Filled, IconEraser, IconTrash } from "@tabler/icons-react";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { useDraftConfig } from "~/hooks/useDraftConfig";

type Props = {
  id: string;
  slice: Slice;
  canRemove?: boolean;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onRandomizeSlice?: () => void;
  onClearSlize?: () => void;
  onRemoveSlice?: () => void;
  onNameChange?: (name: string) => void;
};

export function BuildableSlice({
  id,
  slice,
  canRemove = true,
  onSelectTile,
  onDeleteTile,
  onRandomizeSlice,
  onClearSlize,
  onRemoveSlice,
  onNameChange,
}: Props) {
  const config = useDraftConfig();
  return (
    <BaseSlice
      id={id}
      config={config}
      slice={slice}
      mapModifiable
      titleRight={
        <Group gap={2} wrap="nowrap">
          <Tooltip label="Reroll slice" openDelay={300}>
            <ActionIcon
              size="md"
              variant="subtle"
              color="gray"
              aria-label="Reroll slice"
              onMouseDown={onRandomizeSlice}
            >
              <IconDice6Filled size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Clear tiles" openDelay={300}>
            <ActionIcon
              size="md"
              variant="subtle"
              color="gray"
              aria-label="Clear tiles"
              onMouseDown={onClearSlize}
            >
              <IconEraser size={20} />
            </ActionIcon>
          </Tooltip>
          {onRemoveSlice && (
            <RemoveSliceButton
              sliceName={slice.name}
              disabled={!canRemove}
              onConfirm={onRemoveSlice}
            />
          )}
        </Group>
      }
      onSelectTile={onSelectTile}
      onDeleteTile={onDeleteTile}
      onNameChange={onNameChange}
    />
  );
}

function RemoveSliceButton({
  sliceName,
  disabled,
  onConfirm,
}: {
  sliceName: string;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const [opened, { close, toggle }] = useDisclosure(false);

  if (disabled) {
    return (
      <Tooltip label="Each player needs a slice" openDelay={300}>
        {/* Disabled buttons don't fire pointer events, so the span carries the tooltip */}
        <span>
          <ActionIcon
            size="md"
            variant="subtle"
            color="gray"
            aria-label="Remove slice"
            disabled
          >
            <IconTrash size={20} />
          </ActionIcon>
        </span>
      </Tooltip>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={(next) => !next && close()}
      position="bottom-end"
      withArrow
      shadow="md"
      trapFocus
    >
      <Popover.Target>
        <Tooltip label="Remove slice" openDelay={300} disabled={opened}>
          <ActionIcon
            size="md"
            variant={opened ? "light" : "subtle"}
            color="red"
            aria-label="Remove slice"
            onClick={toggle}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown maw={240}>
        <Text size="sm" fw={600}>
          Remove {sliceName || "this slice"}?
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Its systems go back into the pool.
        </Text>
        <Group justify="flex-end" gap="xs" mt="sm">
          <Button size="compact-sm" variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            size="compact-sm"
            variant="filled"
            color="red.9"
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            Remove
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
