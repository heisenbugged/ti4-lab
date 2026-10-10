import type { ReactNode } from "react";
import type { PlayerColor } from "./types";
import { cx } from "./utils";
import classes from "./SelectableCard.module.css";

export interface SelectableCardProps {
  /** Taken: tinted with the picker's colour. */
  selected?: boolean;
  selectedColor?: PlayerColor;
  /** Currently chosen but not committed: gold brackets. */
  pending?: boolean;
  disabled?: boolean;
  /** Clicking the header selects. */
  onSelect?: () => void;
  header: ReactNode;
  /** Secondary actions row under the header (Info, Wiki…). */
  body?: ReactNode;
  className?: string;
}

/** Card for a draftable thing: header with the name and a pick control, optional footer actions. */
export function SelectableCard({ selected, selectedColor, pending, disabled, onSelect, header, body, className }: SelectableCardProps) {
  const interactive = !!onSelect && !selected && !disabled;
  return (
    <div
      className={cx(classes.card, selected && classes.taken, disabled && !selected && classes.off, pending && "ui-bracket", className)}
      style={selected && selectedColor ? ({ "--p": `var(--player-${selectedColor})` } as React.CSSProperties) : undefined}
    >
      <div
        className={cx(classes.header, interactive && classes.interactive)}
        onClick={interactive ? onSelect : undefined}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.();
                }
              }
            : undefined
        }
      >
        {header}
      </div>
      {body && <div className={classes.body}>{body}</div>}
    </div>
  );
}
