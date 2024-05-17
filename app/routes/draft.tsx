import { Box, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Slice } from "~/components/Slice";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function Draft() {
  return (
    <Group style={{ height: "100vh", width: "100vw" }} align="flex-start">
      <Stack flex={1}>
        <Title>Slices</Title>
        <SimpleGrid flex={1} cols={3} spacing="lg">
          <Stack flex={1} bg="gray.2" px="lg" py="md" gap="lg">
            <Title order={2} c="blue.5">
              Slice 1
            </Title>
            <Slice mapString="0 30 23 37" />
            <Stack>
              <Title order={2} fw="bold" c="gray.6">
                Stats
              </Title>
            </Stack>
          </Stack>
          <Stack flex={1} bg="gray.2" px="lg" py="md">
            <Title order={2} c="blue.5">
              Slice 2
            </Title>
            <Slice mapString="0 30 23 37" />
          </Stack>
          <Stack flex={1} bg="gray.2" px="lg" py="md">
            <Title order={2} c="blue.5">
              Slice 3
            </Title>
            <Slice mapString="0 30 23 37" />
          </Stack>
          <Stack flex={1} bg="gray.2" px="lg" py="md">
            <Title order={2} c="blue.5">
              Slice 4
            </Title>
            <Slice mapString="0 30 23 37" />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Group>
  );
}
