import { Box, Group, Text } from "@mantine/core";
import { useSafeOutletContext } from "~/useSafeOutletContext";

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
  const { accessibleColors } = useSafeOutletContext();

  const accessibleShadow = accessibleColors
    ? {
        WebkitTextStroke: "2px rgba(255, 255, 255, 0.5)",
        paintOrder: "stroke fill",
      }
    : undefined;
  if (legendary) {
    return (
      <Group gap={3} style={{ zIndex: 1 }}>
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
    <Group gap={3} style={{ zIndex: 1 }}>
      <Text
        size={fontSize}
        fw="bolder"
        style={{
          color: "#edff00",
          ["-webkit-text-stroke"]: "2px #40578a5e",
          paintOrder: "stroke fill",
        }}
      >
        {resources}
      </Text>
      <Text size={fontSize} c="blue.9" fw="bolder" style={accessibleShadow}>
        {influence}
      </Text>
    </Group>
  );
}
