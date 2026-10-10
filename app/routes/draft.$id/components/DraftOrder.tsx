import { Draft, DraftPick, HydratedPlayer } from "~/types";
import { DraftOrderChip } from "./DraftOrderChip";
import {
  getDraftOrderEntries,
  getDraftOrderRounds,
  shortSelectionLabel,
} from "./draftOrderUtils";
import classes from "./DraftOrder.module.css";
import { useEffect, useRef } from "react";

type Props = {
  pickOrder: DraftPick[];
  currentPick: number;
  players: HydratedPlayer[];
  /** When given, done picks name what was taken. */
  draft?: Pick<Draft, "slices" | "selections">;
};

/** Every round of the pick order. Done picks name what was taken, the current pick is gold, upcoming picks are dashed. */
export function DraftOrder({ pickOrder, currentPick, players, draft }: Props) {
  const entries = getDraftOrderEntries(pickOrder, players, currentPick);
  const rounds = getDraftOrderRounds(entries, players.length);
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the current pick in view when the strip scrolls sideways.
  useEffect(() => {
    const el = scroller.current;
    const active = el?.querySelector<HTMLElement>('[data-active="true"]');
    if (!el || !active) return;
    if (el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2, behavior: "smooth" });
  }, [currentPick]);

  return (
    <div className={classes.order} ref={scroller} aria-label="Pick order">
      {rounds.map((round, r) => (
        <div className={classes.round} key={r}>
          <small>Round {r + 1}</small>
          <div className={classes.cells} style={{ "--n": players.length } as React.CSSProperties}>
            {round.map((entry) => (
              <DraftOrderChip
                key={`${entry.player.id}-${entry.idx}`}
                entry={entry}
                showDiscord
                label={
                  entry.isActive
                    ? "Picking"
                    : entry.isPassed
                      ? (draft && shortSelectionLabel(draft.selections[entry.idx], draft)) ?? entry.player.name
                      : String(entry.idx + 1)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
