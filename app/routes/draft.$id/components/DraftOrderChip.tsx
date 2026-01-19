import { Group, Text } from "@mantine/core";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { playerColors } from "~/data/factionData";
import type { DraftOrderEntry } from "./draftOrderUtils";

import classes from "~/components/Surface.module.css";
import draftClasses from "./DraftOrder.module.css";

type Props = {
  entry: DraftOrderEntry;
  compact?: boolean;
  showDiscord?: boolean;
  chipSize?: "sm" | "md";
};

export function DraftOrderChip({
  entry,
  compact = false,
  showDiscord = false,
  chipSize = "md",
}: Props) {
  const padding = compact ? 6 : "xs";
  const textSize = compact ? "xs" : "sm";
  const gap = compact ? "xs" : "xs";

  return (
    <Group
      className={[
        classes.surface,
        draftClasses[playerColors[entry.player.id]],
        entry.isActive ? draftClasses.active : "",
        entry.isPassed ? draftClasses.passed : "",
      ].join(" ")}
      p={padding}
      gap={gap}
      data-active={entry.isActive ? "true" : undefined}
      style={chipSize === "sm" ? { borderRadius: "var(--mantine-radius-sm)" } : undefined}
    >
      {showDiscord && entry.player.hasDiscord && (
        <IconBrandDiscordFilled size={14} />
      )}
      <Text ff="heading" size={textSize} fw={"bold"} lh={1}>
        {entry.player.name}
      </Text>
    </Group>
  );
}
