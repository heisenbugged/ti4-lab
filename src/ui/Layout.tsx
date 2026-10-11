import type { CSSProperties, ElementType, ReactNode, HTMLAttributes } from "react";
import { cx, space, type Space } from "./utils";
import classes from "./Layout.module.css";

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around";
const justifyMap: Record<Justify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};
const alignMap: Record<Align, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

type FlexProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  gap?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  grow?: boolean;
  children?: ReactNode;
};

function flexStyle(p: FlexProps, style?: CSSProperties): CSSProperties {
  return {
    gap: space(p.gap),
    alignItems: p.align ? alignMap[p.align] : undefined,
    justifyContent: p.justify ? justifyMap[p.justify] : undefined,
    flexGrow: p.grow ? 1 : undefined,
    ...style,
  };
}

/** Vertical flow with a gap from the spacing scale. */
export function Stack({ as: As = "div", gap = 3, align, justify, grow, className, style, ...rest }: Omit<FlexProps, "wrap"> & { wrap?: never }) {
  return <As className={cx(classes.stack, className)} style={flexStyle({ gap, align, justify, grow }, style)} {...rest} />;
}

/** Horizontal row. Wraps by default; pass wrap={false} for a single line. */
export function Row({ as: As = "div", gap = 2, align = "center", justify, wrap = true, grow, className, style, ...rest }: FlexProps) {
  return (
    <As
      className={cx(classes.row, !wrap && classes.nowrap, className)}
      style={flexStyle({ gap, align, justify, grow }, style)}
      {...rest}
    />
  );
}

type Cols = number | Partial<Record<"base" | "xs" | "sm" | "md" | "lg" | "xl", number>>;

/** Responsive grid. cols may be a number or per-breakpoint, e.g. { base: 1, sm: 2, lg: 3 }. minWidth makes an auto-fill grid instead. */
export function Grid({
  as: As = "div",
  cols = 1,
  minWidth,
  gap = 3,
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType; cols?: Cols; minWidth?: number; gap?: Space }) {
  const vars: Record<string, string | number | undefined> = {};
  if (minWidth) {
    vars["--grid-min"] = `${minWidth}px`;
  } else {
    const c = typeof cols === "number" ? { base: cols } : cols;
    let last = c.base ?? 1;
    for (const bp of ["base", "xs", "sm", "md", "lg", "xl"] as const) {
      if (c[bp] !== undefined) last = c[bp]!;
      vars[`--cols-${bp}`] = last;
    }
  }
  return (
    <As
      className={cx(minWidth ? classes.autoGrid : classes.grid, className)}
      style={{ gap: space(gap), ...vars, ...style } as CSSProperties}
      {...rest}
    />
  );
}

export function Divider({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <hr className={cx(vertical ? classes.vdivider : classes.divider, className)} />;
}

/** Centers its content in both directions. */
export function Center({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(classes.center, className)} {...rest} />;
}

/** Shows children only at or above (or below) a breakpoint. */
export function Visible({ from, below, children }: { from?: "xs" | "sm" | "md" | "lg"; below?: "xs" | "sm" | "md" | "lg"; children: ReactNode }) {
  return <div className={cx(from && classes[`from-${from}`], below && classes[`below-${below}`])}>{children}</div>;
}
