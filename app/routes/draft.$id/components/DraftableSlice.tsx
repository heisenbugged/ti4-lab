import { Button } from "@mantine/core";
import { DraftSlice, HydratedPlayer } from "~/types";
import { BaseSlice } from "~/components/Slice/BaseSlice";
import { PlayerChip } from "./PlayerChip";
import { useSyncDraft } from "~/hooks/useSyncDraft";

type Props = {
  id: string;
  slice: DraftSlice;
  player: HydratedPlayer | undefined;
  onSelect?: () => void;
};

export function DraftableSlice({ id, slice, player, onSelect }: Props) {
  const { syncing } = useSyncDraft();
  return (
    <BaseSlice
      id={id}
      slice={slice}
      mapModifiable={false}
      titleLeft={player ? <PlayerChip player={player} /> : undefined}
      greyOut={!!player}
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
                disabled={syncing}
              >
                Select
              </Button>
            )
          : undefined
      }
    />
  );
}
