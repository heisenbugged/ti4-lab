import { AppShell, Burger, Flex, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
// import Draft from "./draft.$id";
// import Draft from "./draft";

export default function Testing() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell header={{ height: 60 }} px="md">
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Flex align="center" h="100%" px="sm">
          <Text fw="bolder" c="blue.8">
            TI4 Lab
          </Text>
        </Flex>
      </AppShell.Header>

      <AppShell.Main>{/* <Draft /> */}</AppShell.Main>
    </AppShell>
  );
}
