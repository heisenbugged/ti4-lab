import { Button } from "@mantine/core";
import { Slice, HydratedPlayer } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { PlayerChip } from "./PlayerChip";
import { playerColors } from "~/data/factionData";

type Props = {
  id: string;
  slice: Slice;
  player: HydratedPlayer | undefined;
  onSelect?: () => void;
};

export function DraftableSlice({ id, slice, player, onSelect }: Props) {
  const playerColor = player ? playerColors[player.id] : undefined;
  return (
    <div style={{ position: "relative" }}>
      <BaseSlice
        id={id}
        slice={slice}
        mapModifiable={false}
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
      />
    </div>
  );
}
