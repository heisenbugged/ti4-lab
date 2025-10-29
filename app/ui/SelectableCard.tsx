import { ReactNode } from "react";
import { Stack, Box } from "@mantine/core";
import { PlayerColor } from "./types";
import { Surface } from "./Surface";
import classes from "./SelectableCard.module.css";

export interface SelectableCardProps {
  selected?: boolean;
  selectedColor?: PlayerColor;
  hoverable?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  header: ReactNode;
  body: ReactNode;
}

export function SelectableCard({
  selected,
  selectedColor,
  hoverable,
  disabled,
  onSelect,
  header,
  body,
}: SelectableCardProps) {
  const variant = hoverable && onSelect ? "interactive" : "card";
  const color = selected && selectedColor ? selectedColor : undefined;

  return (
    <Stack gap={0}>
      <Surface
        variant={variant}
        color={color}
        className={classes.header}
        onClick={onSelect}
        style={{
          cursor: onSelect ? "pointer" : "default",
          opacity: disabled ? 0.5 : selected ? 0.5 : 1,
          position: "relative",
        }}
      >
        {header}
      </Surface>
      <Box className={classes.body}>
        <Surface variant="card">{body}</Surface>
      </Box>
    </Stack>
  );
}
