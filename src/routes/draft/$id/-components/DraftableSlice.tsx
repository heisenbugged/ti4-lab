import { IconDice5, IconEraser } from "@tabler/icons-react";
import { IconButton, PickButton } from "~/ui";
import { Slice, HydratedPlayer, Tile } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { PlayerChip } from "./PlayerChip";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { playerColorOf } from "./draftOrderUtils";

type Props = {
  id: string;
  slice: Slice;
  player: HydratedPlayer | undefined;
  modifiable?: boolean;
  /** Selected, waiting for Lock in pick. */
  selected?: boolean;
  onSelect?: () => void;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onRandomizeSlice?: () => void;
  onClearSlice?: () => void;
  onNameChange?: (name: string) => void;
};

/** A full-size slice with Select when it is pickable and the owner's name once taken. */
export function DraftableSlice({
  id,
  slice,
  player,
  modifiable = false,
  selected = false,
  onSelect,
  onSelectTile,
  onDeleteTile,
  onRandomizeSlice,
  onClearSlice,
  onNameChange,
}: Props) {
  const config = useDraftConfig();

  const editControls =
    onRandomizeSlice || onClearSlice ? (
      <>
        {onRandomizeSlice && (
          <IconButton size="sm" variant="outline" label="Randomize slice" onClick={onRandomizeSlice}>
            <IconDice5 />
          </IconButton>
        )}
        {onClearSlice && (
          <IconButton size="sm" variant="danger" label="Clear slice" onClick={onClearSlice}>
            <IconEraser />
          </IconButton>
        )}
      </>
    ) : null;

  const right = player ? (
    <>
      {editControls}
      <PlayerChip player={player} size="sm" />
    </>
  ) : onSelect || editControls ? (
    <>
      {editControls}
      {onSelect && <PickButton selected={selected} onClick={onSelect} />}
    </>
  ) : undefined;

  return (
    <BaseSlice
      id={id}
      config={config}
      slice={slice}
      mapModifiable={modifiable}
      selectedColor={player ? playerColorOf(player.id) : undefined}
      pending={selected}
      titleRight={right}
      onSelectTile={onSelectTile}
      onDeleteTile={onDeleteTile}
      onNameChange={onNameChange}
    />
  );
}
