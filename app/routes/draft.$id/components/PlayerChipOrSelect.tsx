import { Badge, Button, Group } from "@mantine/core";
import { PlayerChip } from "./PlayerChip";
import { HydratedPlayer } from "~/types";

type Props = {
  player?: HydratedPlayer;
  isMinor?: boolean;
  disabled?: boolean;
  selectTitle?: string;
  onSelect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSelectMinor?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function PlayerChipOrSelect({
  player,
  isMinor = false,
  disabled = false,
  selectTitle,
  onSelect,
  onSelectMinor,
}: Props) {
  const selectText = selectTitle || "Select";
  return (
    <div
      style={{
        position: "absolute",
        top: -15,
        right: -10,
      }}
    >
      {player && (
        <Group gap={2}>
          {isMinor && (
            <Badge size="xs" color="pink" variant="filled">
              Minor Faction
            </Badge>
          )}
          <PlayerChip player={player} />
        </Group>
      )}
      {!player && (
        <Group gap={4}>
          {onSelectMinor && (
            <Button
              size="compact-xs"
              onMouseDown={onSelectMinor}
              disabled={disabled}
              variant="filled"
              color="pink"
            >
              Minor
            </Button>
          )}
          {onSelect && (
            <Button
              size="compact-xs"
              onMouseDown={onSelect}
              disabled={disabled}
            >
              {onSelectMinor ? "Main" : selectText}
            </Button>
          )}
        </Group>
      )}
    </div>
  );
}
