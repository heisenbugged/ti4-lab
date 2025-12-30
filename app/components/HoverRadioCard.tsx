import { Paper, Stack, Radio, Text, Box } from "@mantine/core";
import { ReactNode } from "react";

import classes from "./HoverRadioCard.module.css";

type Props = {
  title: string;
  description: string;
  checked: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
  icon?: ReactNode;
  /** Compact mode with smaller padding and font sizes */
  compact?: boolean;
};

export function HoverRadioCard({
  title,
  description,
  checked,
  onMouseDown,
  children,
  icon,
  compact = false,
}: Props) {
  return (
    <Paper
      shadow="sm"
      p={compact ? "xs" : "md"}
      withBorder
      onMouseDown={onMouseDown}
      className={`${classes.hoverCard} ${checked ? classes.activeCard : ""}`}
    >
      <Stack align="center" gap={compact ? 4 : "xs"}>
        {icon}
        {!icon && <Radio checked={checked} onChange={() => {}} size={compact ? "xs" : "sm"} />}
        <Text fw={600} ta="center" size={compact ? "xs" : "sm"}>
          {title}
        </Text>
      </Stack>
      <Text size="xs" className={classes.cardDescription} mt={compact ? 4 : "xs"} lh={compact ? 1.2 : undefined}>
        {description}
      </Text>
      {children && (
        <Box mt="auto" pt={compact ? "xs" : "sm"}>
          {children}
        </Box>
      )}
    </Paper>
  );
}
