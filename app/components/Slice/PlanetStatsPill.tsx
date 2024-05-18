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
        px="sm"
        style={{
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 5,
        }}
      >
        <Text fw={600}>{resources}</Text>
      </Box>
      <Box
        bg="blue.4"
        px="sm"
        style={
          !(flex !== undefined)
            ? {
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
              }
            : undefined
        }
      >
        <Text fw={600}>{influence}</Text>
      </Box>
      {flex !== undefined ? (
        <Box
          bg="gray.5"
          px="sm"
          style={
            flex !== undefined
              ? {
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                }
              : undefined
          }
        >
          <Text fw={600}>{flex}</Text>
        </Box>
      ) : undefined}
    </Group>
  );
}
