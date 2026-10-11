import { IconDice5, IconEraser, IconTrash } from "@tabler/icons-react";
import { Slice, Tile } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { Button, IconButton, Popover, Text, useDisclosure } from "~/ui";
import classes from "./BuildableSlice.module.css";

type Props = {
  id: string;
  slice: Slice;
  canRemove?: boolean;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onRandomizeSlice?: () => void;
  onClearSlice?: () => void;
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
  onClearSlice,
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
        <span className={classes.actions}>
          <IconButton
            size="sm"
            label="Reroll slice"
            onMouseDown={onRandomizeSlice}
          >
            <IconDice5 />
          </IconButton>
          <IconButton size="sm" label="Clear tiles" onMouseDown={onClearSlice}>
            <IconEraser />
          </IconButton>
          {onRemoveSlice && (
            <RemoveSliceButton
              sliceName={slice.name}
              disabled={!canRemove}
              onConfirm={onRemoveSlice}
            />
          )}
        </span>
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
  const [opened, { close, set }] = useDisclosure(false);

  if (disabled) {
    return (
      // Disabled buttons don't fire pointer events, so the span carries the tooltip
      <span title="Each player needs a slice" className={classes.disabledWrap}>
        <IconButton size="sm" label="Remove slice" title="Each player needs a slice" disabled>
          <IconTrash />
        </IconButton>
      </span>
    );
  }

  return (
    <Popover
      opened={opened}
      onOpenChange={set}
      side="bottom"
      align="end"
      width={240}
      trigger={
        <IconButton
          size="sm"
          variant={opened ? "danger" : "ghost"}
          label="Remove slice"
          aria-expanded={opened}
          className={classes.remove}
        >
          <IconTrash />
        </IconButton>
      }
    >
      <div className={classes.confirm} role="group" aria-label="Remove slice">
        <Text size="sm" weight={600}>
          Remove {sliceName || "this slice"}?
        </Text>
        <Text size="sm" tone="muted">
          Its systems go back into the pool.
        </Text>
        <div className={classes.confirmActions}>
          <Button size="sm" variant="tertiary" onClick={close}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            Remove
          </Button>
        </div>
      </div>
    </Popover>
  );
}
