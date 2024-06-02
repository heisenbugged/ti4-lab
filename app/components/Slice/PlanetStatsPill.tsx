import { Box, Group, Text, useMantineTheme } from "@mantine/core";
import classes from "./PlanetStatsPill.module.css";

type Props = {
  resources: number;
  influence: number;
  flex?: number;
  size?: "xs" | "sm" | "md" | "lg";
};

export function PlanetStatsPill({
  resources,
  influence,
  flex,
  size = "sm",
}: Props) {
  return (
    <Group gap={2}>
      <Box className={classes.resources} px="xs">
        <Text fw={600} size={size} className={classes.text}>
          {resources}
        </Text>
      </Box>
      <Box
        className={`${classes.influence} ${flex === undefined ? classes.withBorder : ""}`}
        px="xs"
      >
        <Text fw={600} size={size} className={classes.text}>
          {influence}
        </Text>
      </Box>
      {flex !== undefined ? (
        <Box className={classes.flex} px="xs">
          <Text fw={600} size={size} className={classes.text}>
            {flex}
          </Text>
        </Box>
      ) : undefined}
    </Group>
  );
}
