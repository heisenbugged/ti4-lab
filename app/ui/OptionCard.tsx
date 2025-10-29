import { Paper, Stack, Radio, Text, Box } from "@mantine/core";
import { ReactNode } from "react";

import classes from "./OptionCard.module.css";

export interface OptionCardProps {
  title: string;
  description: string;
  checked: boolean;
  onSelect: () => void;
  children?: ReactNode;
  icon?: ReactNode;
}

export function OptionCard({
  title,
  description,
  checked,
  onSelect,
  children,
  icon,
}: OptionCardProps) {
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      onMouseDown={onSelect}
      className={`${classes.hoverCard} ${checked ? classes.activeCard : ""}`}
    >
      <Stack align="center" gap="xs">
        {icon}
        {!icon && <Radio checked={checked} onChange={() => {}} />}
        <Text fw={600} ta="center">
          {title}
        </Text>
      </Stack>
      <Text size="xs" className={classes.cardDescription} mt="xs">
        {description}
      </Text>
      {children && (
        <Box mt="auto" pt="sm">
          {children}
        </Box>
      )}
    </Paper>
  );
}
