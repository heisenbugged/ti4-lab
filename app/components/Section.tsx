import { Group, Stack, Title } from "@mantine/core";
import { ReactNode } from "react";

export function Section({ children }: { children: ReactNode }) {
  return (
    <Stack flex={0} gap="xl">
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
    <Group
      justify="space-between"
      px="sm"
      py="sm"
      style={{
        borderBottom: "var(--mantine-color-spaceBlue-1) solid 1px",
        background:
          "linear-gradient(90deg, var(--mantine-color-spaceBlue-1) 0%, #ffffff 50%)",
        borderTopLeftRadius: 8,
      }}
    >
      <Title order={2}>{title}</Title>
      {children}
    </Group>
  );
}
