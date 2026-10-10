import type { ReactNode } from "react";
import { Stack } from "~/ui";

/** A page section: heading on top, content below. */
export function Section({ children }: { children: ReactNode }) {
  return <Stack gap={4}>{children}</Stack>;
}
