import { Group, Stack, Title } from "@mantine/core";
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
      <Title order={3}>{title}</Title>
      {children}
    </Group>
  );
}
