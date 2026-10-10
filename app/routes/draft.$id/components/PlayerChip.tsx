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
};

/** A player's name in their colour. Long names end in an ellipsis. */
export function PlayerChip({
  player,
  size = "md",
  visibleFrom,
  hiddenFrom,
}: Props) {
  return (
    <PlayerTag
      color={playerColorOf(player.id)}
      name={player.name}
      letter={playerLetter(player.id)}
      size={size === "sm" ? "sm" : "md"}
      className={cx(
        classes.chip,
        visibleFrom && classes[`from-${visibleFrom}`],
        hiddenFrom && classes[`below-${hiddenFrom}`],
      )}
    />
  );
}
