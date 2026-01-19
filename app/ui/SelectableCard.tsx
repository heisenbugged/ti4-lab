import { ReactNode } from "react";
import { Stack, Box } from "@mantine/core";
import { PlayerColor } from "./types";
import { Surface } from "./Surface";
import classes from "./SelectableCard.module.css";

export interface SelectableCardProps {
  selected?: boolean;
  selectedColor?: PlayerColor;
  disabled?: boolean;
  layout?: "split" | "unified";
  interaction?: "none" | "header" | "full";
  onSelect?: () => void;
  header: ReactNode;
  body: ReactNode;
}

export function SelectableCard({
  selected,
  selectedColor,
  disabled,
  layout = "split",
  interaction,
  onSelect,
  header,
  body,
}: SelectableCardProps) {
  const resolvedInteraction = interaction ?? (onSelect ? "header" : "none");
  const isInteractive = !!onSelect && resolvedInteraction !== "none";
  const variant = isInteractive ? "interactive" : "card";
  const color = selected && selectedColor ? selectedColor : undefined;

  if (layout === "unified") {
    return (
      <Surface
        variant={variant}
        color={color}
        className={classes.header}
        onClick={isInteractive ? onSelect : undefined}
        style={{
          cursor: isInteractive ? "pointer" : "default",
          opacity: disabled ? 0.5 : selected ? 0.5 : 1,
          position: "relative",
        }}
      >
        <Stack gap={0}>
          {header}
          <Box className={classes.body}>{body}</Box>
        </Stack>
      </Surface>
    );
  }

  const headerInteractive = resolvedInteraction !== "none";
  const bodyInteractive = resolvedInteraction === "full";

  return (
    <Stack gap={0}>
      <Surface
        variant={variant}
        color={color}
        className={classes.header}
        onClick={headerInteractive ? onSelect : undefined}
        style={{
          cursor: headerInteractive && isInteractive ? "pointer" : "default",
          opacity: disabled ? 0.5 : selected ? 0.5 : 1,
          position: "relative",
        }}
      >
        {header}
      </Surface>
      <Box className={classes.body}>
        <Surface
          variant={bodyInteractive ? variant : "card"}
          onClick={bodyInteractive ? onSelect : undefined}
          style={{ cursor: bodyInteractive && isInteractive ? "pointer" : "default" }}
        >
          {body}
        </Surface>
      </Box>
    </Stack>
  );
}
