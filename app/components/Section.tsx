import { Group, Stack, Text } from "@mantine/core";
import { ReactNode } from "react";
import classes from "./Section.module.css";

export function Section({ children }: { children: ReactNode }) {
  return (
    <Stack flex={0} gap="md">
      {children}
    </Stack>
  );
}

export function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <Group className={classes.section} justify="space-between" px="sm" py="sm">
      <Text
        size="sm"
        fw={600}
        tt="uppercase"
        style={{ letterSpacing: "0.05em", fontFamily: "Orbitron" }}
      >
        {title}
      </Text>
      {children}
    </Group>
  );
}
