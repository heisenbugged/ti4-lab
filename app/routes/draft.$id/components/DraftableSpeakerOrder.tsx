import { PickButton, cx, playerVar, useLanded } from "~/ui";
import { Player } from "~/types";
import { PlayerChip } from "./PlayerChip";
import { playerColorOf } from "./draftOrderUtils";
import classes from "./DraftableSpeakerOrder.module.css";

type Props = {
  speakerOrder: string;
  player?: Player;
  canSelectSpeakerOrder: boolean;
  disabled?: boolean;
  /** Selected, waiting for Lock in pick. */
  selected?: boolean;
  onSelect: () => void;
};

const positionNumber = (speakerOrder: string) => {
  if (speakerOrder === "Speaker") return "1";
  return speakerOrder.replace(/\D/g, "") || "?";
};

/** A speaker order position: Select when open, the owner's name when taken. */
export function DraftableSpeakerOrder({
  speakerOrder,
  player,
  canSelectSpeakerOrder,
  disabled = false,
  selected = false,
  onSelect,
}: Props) {
  const isAvailable = !player && canSelectSpeakerOrder;
  const landed = useLanded(player?.id ?? null) && !!player;

  return (
    <div
      className={cx(
        classes.card,
        isAvailable && !disabled && classes.available,
        !!player && classes.taken,
        selected && "ui-bracket",
      )}
      style={
        player
          ? ({ "--p": playerVar(playerColorOf(player.id)), "--flash": playerVar(playerColorOf(player.id)) } as React.CSSProperties)
          : undefined
      }
      data-landed={landed ? "glow" : undefined}
      onClick={isAvailable && !disabled ? onSelect : undefined}
    >
      <small className={classes.label}>{speakerOrder}</small>
      <b className={classes.number}>{positionNumber(speakerOrder)}</b>
      {isAvailable && (
        <PickButton
          selected={selected}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        />
      )}
      {player && <PlayerChip player={player} size="sm" />}
      {!player && !isAvailable && <span className={classes.open}>Open</span>}
    </div>
  );
}
