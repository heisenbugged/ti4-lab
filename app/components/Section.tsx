import type { ReactNode } from "react";
import { SectionHeader, Stack } from "~/ui";

/** A page section: heading on top, content below. */
export function Section({ children }: { children: ReactNode }) {
  return <Stack gap={4}>{children}</Stack>;
}

/** Section heading with a hairline under it; children sit on the right (actions, counts). */
export function SectionTitle({ title, meta, sticky, children }: { title: ReactNode; meta?: ReactNode; sticky?: boolean; children?: ReactNode }) {
  return (
    <SectionHeader title={title} meta={meta} sticky={sticky}>
      {children}
    </SectionHeader>
  );
}
