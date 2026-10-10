import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { PlayerHex, cx, playerVar, useLanded } from "~/ui";
import type { DraftOrderEntry } from "./draftOrderUtils";
import { playerColorOf, playerLetter } from "./draftOrderUtils";
import classes from "./DraftOrder.module.css";
import { kindVar, type PickKind } from "./PickToken";

type Props = {
  entry: DraftOrderEntry;
  compact?: boolean;
  showDiscord?: boolean;
  chipSize?: "sm" | "md";
  /** Under the hex. Defaults to the player's name. */
  label?: React.ReactNode;
  /** What a done pick took; tints the cell's bottom edge. */
  kind?: PickKind;
};

/** One pick in the pick order: done picks are solid, the current pick is gold, upcoming picks are dashed. */
export function DraftOrderChip({
  entry,
  compact = false,
  showDiscord = false,
  label,
  kind,
}: Props) {
  const color = playerColorOf(entry.player.id);
  // A pick that just happened settles into its cell.
  const landed = useLanded(entry.isPassed) && entry.isPassed;
  return (
    <div
      className={cx(
        classes.cell,
        compact && classes.compact,
        entry.isActive && cx(classes.now, "ui-bracket", "ui-now"),
        !entry.isActive && !entry.isPassed && classes.next,
      )}
      data-active={entry.isActive ? "true" : undefined}
      data-kind={kind}
      data-landed={landed ? "" : undefined}
      style={{ "--p": playerVar(color), "--flash": kind ? kindVar[kind] : playerVar(color), ...(kind ? { "--k": kindVar[kind] } : {}) } as React.CSSProperties}
      title={`Pick ${entry.idx + 1}, ${entry.player.name}`}
    >
      {compact ? (
        <PlayerHex color={color} size="sm">
          {playerLetter(entry.player.id)}
        </PlayerHex>
      ) : (
        <span className={classes.who}>{entry.player.name}</span>
      )}
      <span className={classes.label}>
        {showDiscord && entry.player.hasDiscord && (
          <IconBrandDiscordFilled size={11} className={classes.discord} aria-label="On Discord" />
        )}
        {label ?? entry.player.name}
      </span>
    </div>
  );
}
