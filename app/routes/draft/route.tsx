import { AppShell, Flex, Title } from "@mantine/core";
import { Outlet } from "@remix-run/react";

export default function Draft() {
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Flex align="center" h="100%" px="sm">
          <Title fw="bolder" order={3}>
            TI4 Lab
          </Title>
        </Flex>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
