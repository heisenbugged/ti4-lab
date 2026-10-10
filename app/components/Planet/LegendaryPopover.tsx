import type { ReactNode } from "react";
import { Popover, Text } from "~/ui";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  disabled?: boolean;
};

/** Hover card with a legendary planet's ability. */
export function LegendaryPopover({ children, title, description, disabled = false }: Props) {
  if (disabled || (!title && !description)) {
    return <div style={{ display: "inline-block", pointerEvents: disabled ? "none" : "auto" }}>{children}</div>;
  }
  return (
    <Popover openOnHover side="top" width={300} title={title} trigger={<div style={{ display: "inline-block" }}>{children}</div>}>
      {description && <Text size="sm">{description}</Text>}
    </Popover>
  );
}
