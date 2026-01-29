import { Button, Group } from "@mantine/core";
import { Slice, HydratedPlayer, Tile } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { PlayerChip } from "./PlayerChip";
import { playerColors } from "~/data/factionData";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { IconDice6Filled } from "@tabler/icons-react";

type Props = {
  id: string;
  slice: Slice;
  player: HydratedPlayer | undefined;
  modifiable?: boolean;
  onSelect?: () => void;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onRandomizeSlice?: () => void;
  onClearSlice?: () => void;
  onNameChange?: (name: string) => void;
};

export function DraftableSlice({
  id,
  slice,
  player,
  modifiable = false,
  onSelect,
  onSelectTile,
  onDeleteTile,
  onRandomizeSlice,
  onClearSlice,
  onNameChange,
}: Props) {
  const playerColor = player ? playerColors[player.id] : undefined;
  const config = useDraftConfig();

  const selectionButton =
    !player && onSelect ? (
      <Button lh={1} py={6} px={10} h="auto" onMouseDown={onSelect} variant="filled">
        Select
      </Button>
    ) : null;

  const editControls =
    onRandomizeSlice || onClearSlice ? (
      <Group gap={4}>
        {onRandomizeSlice && (
          <Button
            size="xs"
            onMouseDown={onRandomizeSlice}
            color="gray.7"
            variant="filled"
          >
            <IconDice6Filled size={24} />
          </Button>
        )}
        {onClearSlice && (
          <Button size="xs" onMouseDown={onClearSlice} variant="filled" color="red.9">
            Clear
          </Button>
        )}
      </Group>
    ) : null;

  return (
    <div style={{ position: "relative" }}>
      <BaseSlice
        id={id}
        config={config}
        slice={slice}
        mapModifiable={modifiable}
        selectedColor={playerColor}
        titleLeft={
          player ? (
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -10,
              }}
            >
              <PlayerChip player={player} />
            </div>
          ) : undefined
        }
        titleRight={
          selectionButton || editControls ? (
            <Group gap={6}>
              {selectionButton}
              {editControls}
            </Group>
          ) : undefined
        }
        onSelectTile={onSelectTile}
        onDeleteTile={onDeleteTile}
        onNameChange={onNameChange}
      />
    </div>
  );
}
