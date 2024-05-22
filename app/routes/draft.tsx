import { AppShell, Burger, Flex, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "@remix-run/react";

export default function Draft() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
