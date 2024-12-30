import { Button, Group } from "@mantine/core";
import { Slice, Tile } from "~/types";
import { IconDice6Filled } from "@tabler/icons-react";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { useDraftConfig } from "~/hooks/useDraftConfig";

type Props = {
  id: string;
  slice: Slice;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onRandomizeSlice?: () => void;
  onClearSlize?: () => void;
  onNameChange?: (name: string) => void;
};

export function BuildableSlice({
  id,
  slice,
  onSelectTile,
  onDeleteTile,
  onRandomizeSlice,
  onClearSlize,
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
      onNameChange={onNameChange}
    />
  );
}
