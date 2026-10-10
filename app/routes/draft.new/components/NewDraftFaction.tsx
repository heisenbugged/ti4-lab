import { IconX } from "@tabler/icons-react";
import { Faction } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Checkbox, IconButton, cx } from "~/ui";

import classes from "./NewDraftFaction.module.css";

type Props = {
  faction: Faction;
  checked?: boolean;
  removeEnabled?: boolean;
  onCheck?: (checked: boolean) => void;
  onRemove?: () => void;
  /** Smaller chip, for read-only lists. */
  compact?: boolean;
};

export function NewDraftFaction({
  faction,
  checked,
  removeEnabled = true,
  onCheck,
  onRemove,
  compact,
}: Props) {
  const isSelectable = !!onCheck;

  return (
    <div
      className={cx(classes.faction, compact && classes.compact)}
      data-selectable={isSelectable || undefined}
      data-checked={checked || undefined}
      onMouseDown={isSelectable ? () => onCheck(!checked) : undefined}
    >
      <FactionIcon faction={faction.id} style={compact ? { width: 18, height: 18, flexShrink: 0 } : { width: 28, height: 28, flexShrink: 0 }} />
      <span className={classes.name} title={faction.name}>
        {faction.name}
      </span>
      {onRemove && (
        <IconButton
          label={`Remove ${faction.name}`}
          size="sm"
          className={classes.remove}
          onMouseDown={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={!removeEnabled}
        >
          <IconX />
        </IconButton>
      )}
      {onCheck && (
        <span onMouseDown={(e) => e.stopPropagation()}>
          <Checkbox
            checked={checked}
            onChange={() => onCheck(!checked)}
            aria-label={`Include ${faction.name}`}
          />
        </span>
      )}
    </div>
  );
}
