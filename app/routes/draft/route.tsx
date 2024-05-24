import { AppShell, Flex, Group, Title } from "@mantine/core";
import { Outlet } from "@remix-run/react";

export default function Draft() {
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Group align="center" h="100%" px="sm" gap="sm">
          <img src="/logo.webp" style={{ width: 40 }} />
          <Title fw="bolder" order={3} c="purple.8">
            TI4 Lab
          </Title>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
