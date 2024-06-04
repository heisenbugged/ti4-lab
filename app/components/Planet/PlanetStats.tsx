import { Box, Group, Text } from "@mantine/core";

type Props = {
  legendary?: boolean;
  resources: number;
  influence: number;
  fontSize?: string;
};

export function PlanetStats({
  legendary,
  resources,
  influence,
  fontSize = "25px",
}: Props) {
  if (legendary) {
    return (
      <Group gap={3}>
        <Box bg="yellow" style={{ borderRadius: 8 }} px={2} py={2}>
          <Text size={fontSize} fw="bolder" c="white">
            {resources}
          </Text>
        </Box>
        <Box bg="blue" style={{ borderRadius: 8 }} px={2} py={2}>
          <Text size={fontSize} c="white" fw="bolder">
            {influence}
          </Text>
        </Box>
      </Group>
    );
  }
  return (
    <Group gap={3}>
      <Text size={fontSize} fw="bolder" style={{ color: "#edff00" }} lh={0}>
        {resources}
      </Text>
      <Text size={fontSize} c="blue.9" fw="bolder" lh={0}>
        {influence}
      </Text>
    </Group>
  );
}
