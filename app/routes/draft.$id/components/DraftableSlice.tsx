import { Button } from "@mantine/core";
import { Slice, HydratedPlayer, Tile } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { PlayerChip } from "./PlayerChip";
import { playerColors } from "~/data/factionData";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraft } from "~/draftStore";

type Props = {
  id: string;
  slice: Slice;
  player: HydratedPlayer | undefined;
  modifiable?: boolean;
  onSelect?: () => void;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
};

export function DraftableSlice({
  id,
  slice,
  player,
  modifiable = false,
  onSelect,
  onSelectTile,
  onDeleteTile,
}: Props) {
  const playerColor = player ? playerColors[player.id] : undefined;
  const config = useDraftConfig();

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
          !player
            ? onSelect && (
                <Button
                  lh={1}
                  py={6}
                  px={10}
                  h="auto"
                  onMouseDown={onSelect}
                  variant="filled"
                >
                  Select
                </Button>
              )
            : undefined
        }
        onSelectTile={onSelectTile}
        onDeleteTile={onDeleteTile}
      />
    </div>
  );
}
