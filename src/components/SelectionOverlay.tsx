import { IconCheck } from "@tabler/icons-react";
import { Tag } from "~/ui";
import classes from "./SelectionOverlay.module.css";

type SelectionOverlayProps = {
  visible: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  badgeLabel?: string;
};

const checkSizes = { sm: 18, md: 22, lg: 30 } as const;

/** Gold selection over a card or tile: corner brackets, a check and an optional "Selected" tag. */
export function SelectionOverlay({
  visible,
  size = "md",
  showBadge = true,
  badgeLabel = "Selected",
}: SelectionOverlayProps) {
  if (!visible) return null;

  return (
    <>
      <div className={`${classes.overlay} ui-bracket`} aria-hidden>
        <span className={classes.check} data-size={size}>
          <IconCheck size={checkSizes[size]} stroke={2.5} />
        </span>
      </div>
      {showBadge && (
        <span className={classes.badge}>
          <Tag tone="gold" icon={<IconCheck size={12} />}>
            {badgeLabel}
          </Tag>
        </span>
      )}
    </>
  );
}
