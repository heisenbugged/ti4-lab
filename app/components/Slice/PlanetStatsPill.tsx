import { Box, Group, Text } from "@mantine/core";

type Props = {
  resources: number;
  influence: number;
  flex?: number;
  size?: "xs" | "sm" | "md" | "lg";
};

export function PlanetStatsPill({
  resources,
  influence,
  flex,
  size = "sm",
}: Props) {
  return (
    <Group gap={2}>
      <Box
        bg="yellow"
        px="xs"
        style={{
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 5,
        }}
      >
        <Text fw={600} size={size}>
          {resources}
        </Text>
      </Box>
      <Box
        bg="blue.4"
        px="xs"
        style={
          !(flex !== undefined)
            ? {
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
              }
            : undefined
        }
      >
        <Text fw={600} size={size}>
          {influence}
        </Text>
      </Box>
      {flex !== undefined ? (
        <Box
          bg="purple.2"
          px="xs"
          style={
            flex !== undefined
              ? {
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                }
              : undefined
          }
        >
          <Text fw={600} size={size}>
            {flex}
          </Text>
        </Box>
      ) : undefined}
    </Group>
  );
}
