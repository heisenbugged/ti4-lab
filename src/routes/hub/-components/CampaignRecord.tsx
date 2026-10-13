import { useEffect, useRef, type CSSProperties } from "react";
import { cx } from "~/ui";
import type { HubRecord, HubRecordDraft } from "~/server/hub.functions";
import { draftProgress, draftStatus, draftTitle, formatDay, formatMonthYear, parseDbDate } from "../-utils";
import classes from "../hub.module.css";

/** Hexes between labelled ticks, so dates never collide. */
const MIN_LABEL_GAP = 3;

type Tick = { index: number; label?: string; newMonth: boolean };

/** A hairline wherever the day changes; labelled when there's room for the date. */
function dayTicks(drafts: HubRecordDraft[]): Tick[] {
  const ticks: Tick[] = [];
  let prevDay = "";
  let lastLabel: { index: number; month: string } | undefined;
  drafts.forEach((draft, index) => {
    const date = parseDbDate(draft.createdAt);
    const day = date.toDateString();
    if (day === prevDay) return;
    prevDay = day;
    const month = `${date.getFullYear()}-${date.getMonth()}`;
    const fits = !lastLabel || index - lastLabel.index >= MIN_LABEL_GAP;
    if (!fits) {
      ticks.push({ index, newMonth: false });
      return;
    }
    ticks.push({ index, label: formatDay(draft.createdAt), newMonth: !!lastLabel && lastLabel.month !== month });
    lastLabel = { index, month };
  });
  return ticks;
}

/** The hub's newest drafts as hexes, oldest first: filled when finished, rising as picks are made. */
export function CampaignRecord({ record }: { record: HubRecord }) {
  const scroller = useRef<HTMLDivElement>(null);
  // Already oldest first from the server.
  const ordered = record.drafts;
  const capped = record.total > ordered.length;

  // Newest games are on the right; start there.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [ordered.length]);

  const caption = [
    capped
      ? `Newest ${ordered.length} of ${record.total} drafts`
      : `${record.total} ${record.total === 1 ? "draft" : "drafts"}`,
    `${record.finished} finished`,
    record.live > 0 ? `${record.live} in progress` : undefined,
    record.since ? `since ${formatMonthYear(record.since)}` : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className={classes.record} aria-label="Campaign record">
      <div className={classes.recordHead}>
        <h2 className={classes.recordTitle}>Campaign record</h2>
        {ordered.length > 0 && <span className={classes.recordCaption}>{caption}</span>}
        {ordered.length > 0 && (
          <span className={classes.legend} aria-hidden>
            <span>
              <i className={classes.legendDone} /> Finished
            </span>
            <span>
              <i className={classes.legendLive} /> Fills as picks are made
            </span>
          </span>
        )}
      </div>
      {ordered.length === 0 ? (
        <p className={classes.recordEmpty}>Each draft adds a hex here, oldest on the left.</p>
      ) : (
        <div className={classes.recordScroll} ref={scroller}>
          <div className={cx(classes.recordTrack, capped && classes.recordTrackCapped)}>
            <div className={classes.ticks} aria-hidden>
              {dayTicks(ordered).map((tick) => (
                <span
                  key={tick.index}
                  className={cx(classes.tick, tick.label && classes.tickLabelled, tick.newMonth && classes.tickMonth)}
                  style={{ "--i": tick.index } as CSSProperties}
                >
                  {tick.label && <span>{tick.label}</span>}
                </span>
              ))}
            </div>
            <div className={classes.hexes}>
              {ordered.map((draft, index) => {
                const progress = draftProgress(draft);
                const tone = draft.isComplete ? classes.hexDone : draft.picks > 0 ? classes.hexLive : classes.hexIdle;
                const fromEnd = ordered.length - 1 - index;
                return (
                  <a
                    key={draft.draftId}
                    href={`/draft/${draft.urlName}`}
                    className={cx(classes.hex, tone)}
                    title={`${draftTitle(draft)}, ${formatDay(draft.createdAt)}: ${draftStatus(draft)}`}
                    aria-label={`${draftTitle(draft)}, ${formatDay(draft.createdAt)}, ${draftStatus(draft)}`}
                    style={
                      {
                        "--pct": `${Math.round(progress * 100)}%`,
                        // Light up from the newest backwards.
                        "--delay": `${Math.min(fromEnd, 40) * 22}ms`,
                      } as CSSProperties
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
