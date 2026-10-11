import { PickButton, Row, Tag } from "~/ui";
import { PlayerChip } from "./PlayerChip";
import { HydratedPlayer } from "~/types";

type Props = {
  player?: HydratedPlayer;
  isMinor?: boolean;
  disabled?: boolean;
  selectTitle?: string;
  /** Selected but not locked in yet. */
  selected?: boolean;
  /** The minor pick is the selected one. */
  selectedMinor?: boolean;
  onSelect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSelectMinor?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

/** The owner's tag when taken, otherwise the Select (or Main / Minor) pick buttons. */
export function PlayerChipOrSelect({
  player,
  isMinor = false,
  disabled = false,
  selectTitle,
  selected,
  selectedMinor,
  onSelect,
  onSelectMinor,
}: Props) {
  const selectText = selectTitle || "Select";
  if (player) {
    return (
      <Row gap={1} wrap={false} style={{ minWidth: 0, flexShrink: 1 }}>
        {isMinor && <Tag tone="neutral">Minor</Tag>}
        <PlayerChip player={player} size="sm" />
      </Row>
    );
  }
  if (!onSelect && !onSelectMinor) return null;
  return (
    <Row gap={1} wrap={false} style={{ flex: "none" }}>
      {onSelectMinor && (
        <PickButton
          tone="minor"
          selected={selectedMinor}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelectMinor(event);
          }}
        >
          Minor
        </PickButton>
      )}
      {onSelect && (
        <PickButton
          selected={selected}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(event);
          }}
        >
          {onSelectMinor ? "Main" : selectText}
        </PickButton>
      )}
    </Row>
  );
}
