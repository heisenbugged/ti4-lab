import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { PlayerHex, cx } from "~/ui";
import type { DraftOrderEntry } from "./draftOrderUtils";
import { playerColorOf, playerLetter } from "./draftOrderUtils";
import classes from "./DraftOrder.module.css";

type Props = {
  entry: DraftOrderEntry;
  compact?: boolean;
  showDiscord?: boolean;
  chipSize?: "sm" | "md";
  /** Text under the hex. Defaults to the player's name. */
  label?: string;
};

/** One pick in the pick order: done picks are solid, the current pick is gold, upcoming picks are dashed. */
export function DraftOrderChip({
  entry,
  compact = false,
  showDiscord = false,
  label,
}: Props) {
  const color = playerColorOf(entry.player.id);
  return (
    <div
      className={cx(
        classes.cell,
        compact && classes.compact,
        entry.isActive && cx(classes.now, "ui-bracket"),
        !entry.isActive && !entry.isPassed && classes.next,
      )}
      data-active={entry.isActive ? "true" : undefined}
      title={`Pick ${entry.idx + 1}, ${entry.player.name}`}
    >
      <PlayerHex color={color} size="sm">
        {playerLetter(entry.player.id)}
      </PlayerHex>
      <span className={classes.label}>
        {showDiscord && entry.player.hasDiscord && (
          <IconBrandDiscordFilled size={11} className={classes.discord} aria-label="On Discord" />
        )}
        {label ?? entry.player.name}
      </span>
    </div>
  );
}
