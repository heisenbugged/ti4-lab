import { Button, Group } from "@mantine/core";
import { DraftSlice, TileRef } from "~/types";
import { IconDice6Filled } from "@tabler/icons-react";
import { BaseSlice } from "~/components/Slice/BaseSlice";

type Props = {
  id: string;
  slice: DraftSlice;
  onSelectTile?: (tile: TileRef) => void;
  onDeleteTile?: (tile: TileRef) => void;
  onRandomizeSlice?: () => void;
  onClearSlize?: () => void;
};

export function BuildableSlice({
  id,
  slice,
  onSelectTile,
  onDeleteTile,
  onRandomizeSlice,
  onClearSlize,
}: Props) {
  return (
    <BaseSlice
      id={id}
      slice={slice}
      mapModifiable
      titleRight={
        <Group gap={4}>
          <Button
            size="xs"
            onMouseDown={onRandomizeSlice}
            color="gray.7"
            variant="filled"
          >
            <IconDice6Filled size={24} />
          </Button>
          <Button
            size="xs"
            onMouseDown={onClearSlize}
            variant="filled"
            color="red.9"
          >
            Clear
          </Button>
        </Group>
      }
      onSelectTile={onSelectTile}
      onDeleteTile={onDeleteTile}
    />
  );
}
