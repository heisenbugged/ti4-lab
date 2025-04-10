import { Paper, Stack, Radio, Text, Box } from "@mantine/core";
import { ReactNode } from "react";

import classes from "./HoverRadioCard.module.css";
import { IconDice } from "@tabler/icons-react";

type Props = {
  title: string;
  description: string;
  checked: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
  icon?: ReactNode;
};

export function HoverRadioCard({
  title,
  description,
  checked,
  onMouseDown,
  children,
  icon,
}: Props) {
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      onMouseDown={onMouseDown}
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
