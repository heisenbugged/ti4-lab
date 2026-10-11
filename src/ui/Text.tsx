import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";
import classes from "./Text.module.css";

export type Tone = "default" | "muted" | "faint" | "danger" | "success" | "warning" | "gold" | "ion" | "inherit";

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** xs 12 · sm 13 · md 15 · lg 17 · xl 20 */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: Tone;
  weight?: 400 | 500 | 600 | 700;
  align?: "left" | "center" | "right";
  /** One line with an ellipsis. */
  truncate?: boolean;
  /** Clamp to N lines. */
  lines?: number;
  /** Tabular numerals for values that line up or change. */
  numeric?: boolean;
  /** Small-caps style label (12px, semibold, semi-expanded). */
  label?: boolean;
  children?: ReactNode;
  htmlFor?: string;
};

export function Text({
  as: As = "p",
  size = "md",
  tone = "default",
  weight,
  align,
  truncate,
  lines,
  numeric,
  label,
  className,
  style,
  ...rest
}: TextProps) {
  return (
    <As
      className={cx(
        classes.text,
        classes[`size-${size}`],
        classes[`tone-${tone}`],
        label && classes.label,
        truncate && classes.truncate,
        !!lines && classes.clamp,
        numeric && classes.numeric,
        className,
      )}
      style={{
        fontWeight: weight,
        textAlign: align,
        WebkitLineClamp: lines,
        ...style,
      }}
      {...rest}
    />
  );
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  /** display 44 · title 28 · section 19 · heading 16 */
  variant?: "display" | "title" | "section" | "heading";
  as?: ElementType;
  tone?: Tone;
  truncate?: boolean;
  children?: ReactNode;
};

const defaultTag = { display: "h1", title: "h1", section: "h2", heading: "h3" } as const;

export function Heading({ variant = "section", as, tone = "default", truncate, className, ...rest }: HeadingProps) {
  const As = as ?? defaultTag[variant];
  return (
    <As
      className={cx(classes.heading, classes[`h-${variant}`], classes[`tone-${tone}`], truncate && classes.truncate, className)}
      {...rest}
    />
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={classes.kbd}>{children}</kbd>;
}

export function Code({ children, block }: { children: ReactNode; block?: boolean }) {
  return block ? <pre className={classes.pre}>{children}</pre> : <code className={classes.code}>{children}</code>;
}
