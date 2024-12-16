import { Badge, Button, Group } from "@mantine/core";
import { PlayerChip } from "./PlayerChip";
import { HydratedPlayer } from "~/types";

type Props = {
  player?: HydratedPlayer;
  isMinor?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onSelectMinor?: () => void;
};

export function PlayerChipOrSelect({
  player,
  isMinor = false,
  disabled = false,
  onSelect,
  onSelectMinor,
}: Props) {
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
              {onSelectMinor ? "Main" : "Select"}
            </Button>
          )}
        </Group>
      )}
    </div>
  );
}
