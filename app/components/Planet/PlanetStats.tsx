import { Group, Text } from "@mantine/core";

type Props = {
  resources: number;
  influence: number;
  fontSize?: string;
};

export function PlanetStats({ resources, influence, fontSize = "25" }: Props) {
  return (
    <Group gap={3}>
      <Text size={fontSize} fw="bolder" style={{ color: "yellow" }} lh={0}>
        {resources}
      </Text>
      <Text size={fontSize} c="blue.9" fw="bolder" lh={0}>
        {influence}
      </Text>
    </Group>
  );
}
