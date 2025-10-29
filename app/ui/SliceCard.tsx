import { ReactNode } from "react";
import { Box, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { PlayerColor } from "./types";
import classes from "./SliceCard.module.css";
import { Titles } from "~/components/Titles";

export interface SliceCardProps {
  name: string;
  playerColor?: PlayerColor;
  editable?: boolean;
  onNameChange?: (name: string) => void;
  header?: ReactNode;
  stats: ReactNode;
  features: ReactNode;
  children: ReactNode; // map content
}

export function SliceCard({
  name,
  playerColor,
  editable,
  onNameChange,
  header,
  stats,
  features,
  children,
}: SliceCardProps) {
  const colorClass = playerColor ? classes[playerColor] : "";

  return (
    <Paper
      shadow="sm"
      style={{ opacity: playerColor ? 0.5 : 1 }}
      className={colorClass}
    >
      <Stack flex={1} gap={0}>
        <Group className={`${classes.header} ${colorClass}`}>
          <Group gap={2} flex={1}>
            {editable && onNameChange ? (
              <TextInput
                className={classes.editableSliceName}
                value={name}
                mr="xs"
                fw="bold"
                w="auto"
                flex={1}
                onChange={(e) => onNameChange?.(e.target.value)}
              />
            ) : (
              <Titles.Slice className={`${classes.sliceText} ${colorClass}`}>
                {name}
              </Titles.Slice>
            )}
          </Group>
          {header}
        </Group>

        <Group className={classes.stats}>{stats}</Group>

        <Box className={classes.map}>{children}</Box>

        <Box className={`${classes.features} ${colorClass}`}>{features}</Box>
      </Stack>
    </Paper>
  );
}
