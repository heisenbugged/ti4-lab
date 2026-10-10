import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconCheck } from "@tabler/icons-react";
import { cx } from "./utils";
import classes from "./Navigation.module.css";

/* ── Tabs: sibling views of the same object ─────────────────────── */

type TabItem<V extends string> = { value: V; label: ReactNode; count?: ReactNode; disabled?: boolean };

export function Tabs<V extends string>({
  value,
  defaultValue,
  onChange,
  items,
  label,
  children,
  variant = "line",
  className,
}: {
  value?: V;
  defaultValue?: V;
  onChange?: (v: V) => void;
  items: TabItem<V>[];
  label: string;
  /** Panels: <TabPanel value="…"> */
  children?: ReactNode;
  /** line: underline tabs · pills: segmented look for compact headers */
  variant?: "line" | "pills";
  className?: string;
}) {
  return (
    <BaseTabs.Root value={value} defaultValue={defaultValue ?? items[0]?.value} onValueChange={(v) => onChange?.(v as V)} className={cx(classes.tabsRoot, className)}>
      <BaseTabs.List className={cx(variant === "pills" ? classes.pills : classes.tabs)} aria-label={label}>
        {items.map((t) => (
          <BaseTabs.Tab key={t.value} value={t.value} disabled={t.disabled} className={variant === "pills" ? classes.pill : classes.tab}>
            {t.label}
            {t.count !== undefined && <span className={classes.count}>{t.count}</span>}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {children}
    </BaseTabs.Root>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <BaseTabs.Panel value={value} className={cx(classes.panel, className)}>
      {children}
    </BaseTabs.Panel>
  );
}

/* ── Accordion ──────────────────────────────────────────────────── */

export function Accordion({ items, defaultOpen, multiple = true }: { items: Array<{ value: string; title: ReactNode; content: ReactNode }>; defaultOpen?: string[]; multiple?: boolean }) {
  return (
    <BaseAccordion.Root defaultValue={defaultOpen} multiple={multiple} className={classes.accordion}>
      {items.map((it) => (
        <BaseAccordion.Item key={it.value} value={it.value} className={classes.accItem}>
          <BaseAccordion.Header className={classes.accHeader}>
            <BaseAccordion.Trigger className={classes.accTrigger}>
              <span>{it.title}</span>
              <IconChevronDown size={16} className={classes.accChev} />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className={classes.accPanel}>
            <div className={classes.accBody}>{it.content}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}

/* ── Steps: a numbered sequence ─────────────────────────────────── */

export function Steps({ active = 0, items }: { active?: number; items: Array<{ title: ReactNode; content?: ReactNode }> }) {
  return (
    <ol className={classes.steps}>
      {items.map((it, i) => (
        <li key={i} className={cx(classes.step, i < active && classes.done, i === active && classes.current)}>
          <span className={classes.stepNum}>{i < active ? <IconCheck size={14} /> : i + 1}</span>
          <div className={classes.stepBody}>
            <b>{it.title}</b>
            {it.content}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Pagination ─────────────────────────────────────────────────── */

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages: Array<number | "…"> = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className={classes.pager} aria-label="Pages">
      <button type="button" className={classes.pageBtn} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <IconChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className={classes.ellipsis}>
            …
          </span>
        ) : (
          <button key={p} type="button" className={classes.pageBtn} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>
            {p}
          </button>
        ),
      )}
      <button type="button" className={classes.pageBtn} disabled={page >= total} onClick={() => onChange(page + 1)} aria-label="Next page">
        <IconChevronRight size={16} />
      </button>
    </nav>
  );
}
