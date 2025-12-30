import { Box, Group, Text, ThemeIcon } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

export function SettingsSection({ title, icon, children }: Props) {
  return (
    <Box
      p="xs"
      style={{
        borderRadius: 4,
        background: "var(--mantine-color-default)",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    >
      <Group gap="xs" mb="xs" pb={6} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <ThemeIcon size="sm" variant="light" color="purple" radius="sm">
          {icon}
        </ThemeIcon>
        <Text
          size="xs"
          fw={600}
          tt="uppercase"
          style={{
            letterSpacing: "0.08em",
            fontFamily: "Orbitron",
          }}
          c="dimmed"
        >
          {title}
        </Text>
      </Group>
      <Box>{children}</Box>
    </Box>
  );
}
