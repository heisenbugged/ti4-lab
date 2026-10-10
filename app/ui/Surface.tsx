import { forwardRef, useState, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { IconChevronDown } from "@tabler/icons-react";
import { cx } from "./utils";
import type { PlayerColor } from "./types";
import classes from "./Surface.module.css";

/* ── Panel ──────────────────────────────────────────────────────── */

type PanelProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  icon?: ReactNode;
  /** Tint for the icon square, e.g. "var(--ion)". */
  iconTint?: string;
  /** Right side of the header: an action, tag or count. */
  action?: ReactNode;
  /** Sunken well, for maps and read-only results. */
  well?: boolean;
  /** Remove body padding (tables, lists, maps that run edge to edge). */
  flush?: boolean;
  /** Collapsible header. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Shown in the header while collapsed. */
  summary?: ReactNode;
};

/** A flat surface with a hairline edge and an optional 48px header. Panels never nest. */
export function Panel({ title, icon, iconTint, action, well, flush, collapsible, defaultOpen = true, summary, className, children, ...rest }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const head = title !== undefined && (
    <>
      {icon && <IconSquare tint={iconTint}>{icon}</IconSquare>}
      <h3 className={classes.title}>{title}</h3>
      {collapsible && !open && summary && <span className={classes.summary}>{summary}</span>}
      {action && <div className={classes.action}>{action}</div>}
    </>
  );
  if (collapsible) {
    return (
      <Collapsible.Root open={open} onOpenChange={setOpen} render={<section className={cx(classes.panel, well && classes.well, className)} {...rest} />}>
        <Collapsible.Trigger className={cx(classes.head, classes.trigger)}>
          {head}
          <IconChevronDown size={16} className={classes.chev} />
        </Collapsible.Trigger>
        <Collapsible.Panel className={classes.collapse}>
          <div className={cx(classes.body, flush && classes.flush)}>{children}</div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }
  return (
    <section className={cx(classes.panel, well && classes.well, className)} {...rest}>
      {title !== undefined && <header className={classes.head}>{head}</header>}
      <div className={cx(classes.body, flush && classes.flush)}>{children}</div>
    </section>
  );
}

/** Tinted icon square used in panel and section headers. */
export function IconSquare({ tint = "var(--text-muted)", children, size = 26 }: { tint?: string; children: ReactNode; size?: number }) {
  return (
    <span className={classes.iconSquare} style={{ "--t": tint, width: size, height: size } as React.CSSProperties}>
      {children}
    </span>
  );
}

/** Rows divided by hairlines, for settings inside a panel. */
export function Rows({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(classes.rows, className)} {...rest} />;
}

/** Label (with optional hint) on the left, control on the right. */
export function ListRow({ label, hint, children, className, disabled }: { label: ReactNode; hint?: ReactNode; children?: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <div className={cx(classes.row, disabled && classes.rowDisabled, className)}>
      <div className={classes.rowLabel}>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      {children !== undefined && <div className={classes.rowControl}>{children}</div>}
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────────── */

export type CardProps = ComponentPropsWithoutRef<"div"> & {
  /** Interactive cards lift on hover. */
  interactive?: boolean;
  /** Selected: gold corner brackets. */
  selected?: boolean;
  /** Taken by a player: tinted with their colour. */
  playerColor?: PlayerColor;
  /** Dashed and dimmed. */
  off?: boolean;
  sunken?: boolean;
  padding?: 0 | 2 | 3 | 4;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, selected, playerColor, off, sunken, padding = 3, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        classes.card,
        interactive && classes.interactive,
        selected && "ui-bracket",
        playerColor && classes.taken,
        off && classes.off,
        sunken && classes.sunken,
        className,
      )}
      style={{ padding: padding ? `var(--space-${padding})` : 0, ...(playerColor ? { "--p": `var(--player-${playerColor})` } : {}), ...style } as React.CSSProperties}
      {...rest}
    />
  );
});

/* ── Page section heading ───────────────────────────────────────── */

/** Section heading with a hairline under it and optional actions on the right. */
export function SectionHeader({ title, meta, children, sticky, className }: { title: ReactNode; meta?: ReactNode; children?: ReactNode; sticky?: boolean; className?: string }) {
  return (
    <div className={cx(classes.sectionHead, sticky && classes.sticky, className)}>
      <h2 className={classes.sectionTitle}>{title}</h2>
      {meta && <span className={classes.sectionMeta}>{meta}</span>}
      {children && <div className={classes.sectionActions}>{children}</div>}
    </div>
  );
}

/* ── Table ──────────────────────────────────────────────────────── */

type TableProps = ComponentPropsWithoutRef<"table"> & { striped?: boolean; dense?: boolean; hover?: boolean; minWidth?: number };

function TableRoot({ className, striped, dense, hover = true, minWidth, ...rest }: TableProps) {
  return (
    <div className={classes.tableWrap}>
      <table className={cx(classes.table, striped && classes.striped, dense && classes.dense, hover && classes.hover, className)} style={{ minWidth }} {...rest} />
    </div>
  );
}
export const Table = Object.assign(TableRoot, {
  Thead: (p: ComponentPropsWithoutRef<"thead">) => <thead {...p} />,
  Tbody: (p: ComponentPropsWithoutRef<"tbody">) => <tbody {...p} />,
  Tfoot: (p: ComponentPropsWithoutRef<"tfoot">) => <tfoot {...p} />,
  Tr: (p: ComponentPropsWithoutRef<"tr">) => <tr {...p} />,
  Th: (p: ComponentPropsWithoutRef<"th">) => <th {...p} />,
  Td: ({ numeric, className, ...p }: ComponentPropsWithoutRef<"td"> & { numeric?: boolean }) => <td className={cx(numeric && classes.num, className)} {...p} />,
});

