import { Button } from "@mantine/core";
import { PlayerChip } from "./PlayerChip";
import { Player } from "~/types";

type Props = {
  player?: Player;
  onSelect?: () => void;
};

export function PlayerChipOrSelect({ player, onSelect }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        right: -10,
      }}
    >
      {player && <PlayerChip player={player} />}
      {!player && onSelect && (
        <Button size="xs" onMouseDown={onSelect}>
          Select
        </Button>
      )}
    </div>
  );
}
