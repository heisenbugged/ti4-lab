import { Button } from "@mantine/core";
import { PlayerChip } from "./PlayerChip";
import { Player } from "~/types";

type Props = {
  player?: Player;
  disabled?: boolean;
  onSelect?: () => void;
};

export function PlayerChipOrSelect({
  player,
  disabled = false,
  onSelect,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: -15,
        right: -10,
      }}
    >
      {player && <PlayerChip player={player} />}
      {!player && onSelect && (
        <Button size="compact-xs" onMouseDown={onSelect} disabled={disabled}>
          Select
        </Button>
      )}
    </div>
  );
}
