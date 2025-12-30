import { Stack, Text, Box, Button } from "@mantine/core";
import { Player } from "~/types";
import { PlayerChip } from "./PlayerChip";
import { playerColors } from "~/data/factionData";
import { PlayerColor } from "~/ui";
import classes from "./DraftableSpeakerOrder.module.css";

type Props = {
  speakerOrder: string;
  player?: Player;
  canSelectSpeakerOrder: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

// Map speaker order text to position numbers for display
const positionDisplay: Record<string, { number: string; label: string }> = {
  Speaker: { number: "01", label: "SPEAKER" },
  "2nd": { number: "02", label: "SECOND" },
  "3rd": { number: "03", label: "THIRD" },
  "4th": { number: "04", label: "FOURTH" },
  "5th": { number: "05", label: "FIFTH" },
  "6th": { number: "06", label: "SIXTH" },
  "7th": { number: "07", label: "SEVENTH" },
  "8th": { number: "08", label: "EIGHTH" },
};

export function DraftableSpeakerOrder({
  speakerOrder,
  player,
  canSelectSpeakerOrder,
  disabled = false,
  onSelect,
}: Props) {
  const playerColor = player
    ? (playerColors[player.id] as PlayerColor)
    : undefined;
  const display = positionDisplay[speakerOrder] ?? {
    number: "??",
    label: speakerOrder.toUpperCase(),
  };

  const isAvailable = !player && canSelectSpeakerOrder;
  const isClaimed = !!player;

  const cardClasses = [
    classes.speakerCard,
    isAvailable && classes.available,
    isClaimed && classes.claimed,
    isClaimed && playerColor && classes[playerColor],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Box
      className={cardClasses}
      onClick={isAvailable && !disabled ? onSelect : undefined}
    >
      <Stack align="center" p="sm" pos="relative" gap={8} justify="center">
        {/* Position badge */}
        <Text component="span" className={classes.positionBadge}>
          {display.label}
        </Text>

        {/* Large position number */}
        <Text className={classes.positionNumber} fz={28}>
          {display.number}
        </Text>

        {/* Select button or player chip */}
        {isAvailable && (
          <Button
            size="compact-sm"
            px="lg"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Select
          </Button>
        )}

        {player && <PlayerChip player={player} />}
      </Stack>
    </Box>
  );
}
