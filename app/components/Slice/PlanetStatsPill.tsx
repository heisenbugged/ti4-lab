import { Box, Group, Text } from "@mantine/core";

type Props = {
  resources: number;
  influence: number;
  flex?: number;
};

export function PlanetStatsPill({ resources, influence, flex }: Props) {
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
        <Text fw={600} size="sm">
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
        <Text fw={600} size="sm">
          {influence}
        </Text>
      </Box>
      {flex !== undefined ? (
        <Box
          bg="gray.5"
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
          <Text fw={600} size="sm">
            {flex}
          </Text>
        </Box>
      ) : undefined}
    </Group>
  );
}
