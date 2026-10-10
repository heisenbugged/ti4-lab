import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";
import type { PlayerColor } from "./types";
import classes from "./Game.module.css";

export const playerVar = (c?: PlayerColor | string) => (c ? `var(--player-${c})` : "var(--rule-strong)");

/** Hexagonal player chip with the seat letter. */
export function PlayerHex({ color, children, size = "md", title }: { color?: PlayerColor | string; children?: ReactNode; size?: "sm" | "md" | "lg"; title?: string }) {
  return (
    <span className={cx(classes.hex, classes[`hex-${size}`])} style={{ "--p": playerVar(color) } as CSSProperties} title={title}>
      {children}
    </span>
  );
}

/** A player's name in their colour. Long names truncate. */
export function PlayerTag({
  color,
  name,
  letter,
  size = "md",
  className,
}: {
  color?: PlayerColor | string;
  name: ReactNode;
  letter?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cx(classes.owner, size === "sm" && classes.ownerSm, className)} style={{ "--p": playerVar(color) } as CSSProperties} title={typeof name === "string" ? name : undefined}>
      {letter !== undefined ? <PlayerHex color={color} size="sm">{letter}</PlayerHex> : <i className={classes.dot} />}
      <span className={classes.ownerName}>{name}</span>
    </span>
  );
}

export function PlayerDot({ color, size = 10 }: { color?: PlayerColor | string; size?: number }) {
  return <i className={classes.dot} style={{ "--p": playerVar(color), width: size, height: size } as CSSProperties} />;
}

/** Resources · influence (· flex) as gold/blue(/violet) value boxes, with an optional total. */
export function ValuePill({ r, i, f, total, size = "md" }: { r: number | string; i: number | string; f?: number | string; total?: number | string; size?: "sm" | "md" }) {
  return (
    <span className={cx(classes.ri, size === "sm" && classes.riSm)} title={`${r} resources, ${i} influence${f !== undefined ? `, ${f} flex` : ""}`}>
      <span className={classes.r}>{r}</span>
      <span className={classes.i}>{i}</span>
      {f !== undefined && <span className={classes.f}>{f}</span>}
      {total !== undefined && <em className={classes.total}>({total})</em>}
    </span>
  );
}

/** Big number with a small label under it. */
export function Stat({ value, label, size = "md" }: { value: ReactNode; label: ReactNode; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cx(classes.stat, classes[`stat-${size}`])}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/** Proper name on a chamfered plate, as printed on the tiles. */
export function NamePlate({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(classes.plate, className)}>{children}</span>;
}

/** Wrapper that draws gold selection brackets around its child. */
export function Bracket({ active = true, className, ...rest }: HTMLAttributes<HTMLDivElement> & { active?: boolean }) {
  return <div className={cx(active && "ui-bracket", className)} {...rest} />;
}
