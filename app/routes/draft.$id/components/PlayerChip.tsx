import { PlayerTag, cx } from "~/ui";
import { Player } from "~/types";
import { playerColorOf, playerLetter } from "./draftOrderUtils";
import classes from "./PlayerChip.module.css";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

type Props = {
  player: Player;
  size?: "sm" | "md" | "lg" | "xl";
  visibleFrom?: Breakpoint;
  hiddenFrom?: Breakpoint;
  /** Smaller chip for tight spaces (home tiles). */
  compact?: boolean;
  /** Show the seat letter hex instead of a dot (default true). */
  withLetter?: boolean;
  className?: string;
};

/** A player's name in their colour. Long names end in an ellipsis. */
export function PlayerChip({
  player,
  size = "md",
  visibleFrom,
  hiddenFrom,
  compact = false,
  withLetter = true,
  className,
}: Props) {
  return (
    <PlayerTag
      color={playerColorOf(player.id)}
      name={player.name}
      letter={withLetter ? playerLetter(player.id) : undefined}
      size={compact || size === "sm" ? "sm" : "md"}
      className={cx(
        classes.chip,
        visibleFrom && classes[`from-${visibleFrom}`],
        hiddenFrom && classes[`below-${hiddenFrom}`],
        className,
      )}
    />
  );
}
