import { useEffect, useRef, useState } from "react";
import { DraftPick, HydratedPlayer } from "~/types";
import { DraftOrderChip } from "./DraftOrderChip";
import { getDraftOrderEntries } from "./draftOrderUtils";
import classes from "./RollingDraftOrder.module.css";

type Props = {
  pickOrder: DraftPick[];
  currentPick: number;
  players: HydratedPlayer[];
};

/** One line of picks that slides to keep the current pick in the middle. */
export function RollingDraftOrder({ pickOrder, currentPick, players }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const entries = getDraftOrderEntries(pickOrder, players, currentPick);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Center the active pick, which needs its measured position.
  useEffect(() => {
    const active = trackRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    setOffset(containerWidth / 2 - active.offsetLeft - active.offsetWidth / 2);
  }, [containerWidth, currentPick, pickOrder]);

  return (
    <div ref={containerRef} className={classes.container}>
      <div className={classes.fadeLeft} />
      <div className={classes.fadeRight} />
      <div
        ref={trackRef}
        className={classes.track}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {entries.map((entry) => (
          <DraftOrderChip
            key={`${entry.player.id}-${entry.idx}`}
            entry={entry}
            compact
            chipSize="sm"
          />
        ))}
      </div>
    </div>
  );
}
