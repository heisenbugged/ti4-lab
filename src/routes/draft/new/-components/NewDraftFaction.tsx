import { IconX } from "@tabler/icons-react";
import { Faction } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { IconButton, cx } from "~/ui";

import classes from "./NewDraftFaction.module.css";

type Props = {
  faction: Faction;
  removeEnabled?: boolean;
  onRemove?: () => void;
  /** Smaller chip, for read-only lists. */
  compact?: boolean;
};

export function NewDraftFaction({
  faction,
  removeEnabled = true,
  onRemove,
  compact,
}: Props) {
  return (
    <div className={cx(classes.faction, compact && classes.compact)}>
      <FactionIcon faction={faction.id} style={compact ? { width: 18, height: 18, flexShrink: 0 } : { width: 28, height: 28, flexShrink: 0 }} />
      <span className={classes.name} title={faction.name}>
        {faction.name}
      </span>
      {onRemove && (
        <IconButton
          label={`Remove ${faction.name}`}
          size="sm"
          className={classes.remove}
          onMouseDown={onRemove}
          disabled={!removeEnabled}
        >
          <IconX />
        </IconButton>
      )}
    </div>
  );
}
