import { Box, Group, Text } from "@mantine/core";
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
    <Group style={{ height: "100vh", width: "100vw" }} align="stretch">
      <Box w="250" h="100%" bg="gray">
        <Text>hi</Text>
      </Box>
      <Group flex={1} align="stretch">
        <Box flex={1} miw={300} mah="60%">
          <Slice mapString="0 30 23 37" />
        </Box>
        <Box flex={1} miw={300} mah="60%">
          <Slice mapString="0 66 43 69" />
        </Box>
        <Box flex={1} miw={300} mah="60%">
          <Slice mapString="0 67 22 21" />
        </Box>
      </Group>
    </Group>
  );
}
