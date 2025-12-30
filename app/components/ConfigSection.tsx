import { Box, Collapse, Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { ReactNode } from "react";

type Props = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  /** If true, section starts collapsed and can be toggled */
  collapsible?: boolean;
  /** Initial collapsed state (only applies if collapsible is true) */
  defaultCollapsed?: boolean;
  /** Color variant for the icon */
  color?: string;
  /** Optional badge/count to show in header */
  badge?: ReactNode;
};

export function ConfigSection({
  title,
  icon,
  children,
  collapsible = false,
  defaultCollapsed = true,
  color = "purple",
  badge,
}: Props) {
  const [opened, { toggle }] = useDisclosure(!defaultCollapsed);

  const header = (
    <Group
      gap="xs"
      pb={collapsible && !opened ? 0 : 6}
      mb={collapsible && !opened ? 0 : "xs"}
      style={{
        borderBottom:
          collapsible && !opened
            ? "none"
            : "1px solid var(--mantine-color-default-border)",
      }}
    >
      <ThemeIcon size="sm" variant="light" color={color} radius="sm">
        {icon}
      </ThemeIcon>
      <Text
        size="xs"
        fw={600}
        tt="uppercase"
        style={{
          letterSpacing: "0.08em",
          fontFamily: "Orbitron",
          flex: 1,
        }}
        c="dimmed"
      >
        {title}
      </Text>
      {badge}
      {collapsible && (
        opened ? <IconChevronDown size={14} color="var(--mantine-color-dimmed)" /> : <IconChevronRight size={14} color="var(--mantine-color-dimmed)" />
      )}
    </Group>
  );

  return (
    <Box
      p="xs"
      style={{
        borderRadius: 4,
        background: "var(--mantine-color-default)",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {collapsible ? (
        <>
          <UnstyledButton onClick={toggle} w="100%">
            {header}
          </UnstyledButton>
          <Collapse in={opened}>
            <Box>{children}</Box>
          </Collapse>
        </>
      ) : (
        <>
          {header}
          <Box>{children}</Box>
        </>
      )}
    </Box>
  );
}
