import { Popover } from "~/ui";
import classes from "./SliceValuePopover.module.css";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { Slice } from "~/types";
import { useSliceValueBreakdown } from "~/hooks/useSliceValueBreakdown";
import type { SliceValueBreakdown } from "~/stats";

type Props = {
  /** Shown inside the trigger before the icon (e.g. "SV 12.8") so the whole value is the hover target. */
  children?: React.ReactNode;
  slice?: Slice;
  breakdown?: SliceValueBreakdown;
  title?: string;
  /** Use light variant for dark backgrounds, dark variant for light backgrounds */
  variant?: "light" | "dark";
};

function formatValue(value: number, showSign = false): string {
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
  if (showSign && value > 0) return `+${formatted}`;
  if (showSign && value < 0) return formatted; // negative already has sign
  return formatted;
}

export function SliceValuePopover({
  slice,
  breakdown: providedBreakdown,
  title = "Slice value",
  variant = "light",
  children,
}: Props) {
  const computedBreakdown = useSliceValueBreakdown(slice);
  const breakdown = providedBreakdown ?? computedBreakdown;

  if (!breakdown) return null;

  // Separate positive modifiers (bonuses) from negative modifiers (penalties)
  const bonuses = breakdown.modifiers.filter((mod) => mod.value >= 0);
  const penalties = breakdown.modifiers.filter((mod) => mod.value < 0);

  const hasBonuses = bonuses.length > 0;
  const hasPenalties = penalties.length > 0;
  const hasEquidistant = breakdown.equidistantPenalty !== null;
  const hasAnyPenalty = hasPenalties || hasEquidistant;

  return (
    <Popover
      openOnHover
      side="top"
      width={260}
      trigger={
        <button
          type="button"
          className={[classes.trigger, variant === "dark" && classes.dark, children !== undefined && classes.withValue].filter(Boolean).join(" ")}
          aria-label={`${title} breakdown`}
        >
          {children}
          <IconInfoCircleFilled size={14} />
        </button>
      }
    >
      <div className={classes.head}>
        <span>{title}</span>
        <b>{formatValue(breakdown.total)}</b>
      </div>

      <div className={classes.group}>
        <span className={classes.groupLabel}>Base optimal</span>
        <div className={classes.line}>
          <span>
            <i className={classes.r}>R</i> + <i className={classes.i}>I</i> + <i className={classes.f}>F</i>{" "}
            <span className={classes.muted}>
              ({breakdown.optimal.resources}+{breakdown.optimal.influence}+{breakdown.optimal.flex})
            </span>
          </span>
          <b>{formatValue(breakdown.optimal.sum)}</b>
        </div>
      </div>

      {hasBonuses && (
        <div className={classes.group}>
          <span className={classes.groupLabel}>Bonuses</span>
          {bonuses.map((mod, idx) => (
            <div key={idx} className={classes.line}>
              <span>
                {mod.label}
                {mod.count !== undefined && <span className={classes.muted}> ({mod.count})</span>}
              </span>
              <b className={classes.plus}>{formatValue(mod.value, true)}</b>
            </div>
          ))}
        </div>
      )}

      {hasAnyPenalty && (
        <div className={classes.group}>
          <span className={classes.groupLabel}>Penalties</span>
          {penalties.map((mod, idx) => (
            <div key={idx} className={classes.line}>
              <span>{mod.label}</span>
              <b className={classes.minus}>{formatValue(mod.value, true)}</b>
            </div>
          ))}
          {hasEquidistant && (
            <div className={classes.line}>
              <span>
                {/* Show percentage only if using fixed multiplier system (multiplier != 1) */}
                {breakdown.equidistantMultiplier !== 1
                  ? `Equidistant (${Math.round((1 - breakdown.equidistantMultiplier) * 100)}%)`
                  : "Equidistant"}
              </span>
              <b className={classes.minus}>{formatValue(-breakdown.equidistantPenalty!, true)}</b>
            </div>
          )}
        </div>
      )}
    </Popover>
  );
}
