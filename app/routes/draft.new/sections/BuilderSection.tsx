import type { ReactNode } from "react";
import { cx } from "~/ui";
import classes from "./BuilderSection.module.css";

type Props = {
  title: ReactNode;
  /** Short status on the right, e.g. "6 of 8". */
  meta?: ReactNode;
  /** Tools on the right of the heading (below it on a phone). */
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
  children?: ReactNode;
};

/** A titled section of the draft builder: heading with a hairline, then content. */
export function BuilderSection({
  title,
  meta,
  actions,
  sticky,
  className,
  children,
}: Props) {
  return (
    <section className={cx(classes.section, className)}>
      <div className={cx(classes.head, sticky && classes.sticky)}>
        <h2 className={classes.title}>{title}</h2>
        {meta !== undefined && <span className={classes.meta}>{meta}</span>}
        {actions && <div className={classes.tools}>{actions}</div>}
      </div>
      {children}
    </section>
  );
}
