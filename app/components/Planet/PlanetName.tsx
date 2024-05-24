import { Box, Text } from "@mantine/core";

type Props = {
  children: string;
  legendary?: boolean;
};

export function PlanetName({ children, legendary = false }: Props) {
  return (
    <Box
      pos="absolute"
      top={50 - 10}
      right={0}
      left={0}
      bg={legendary ? "#d27900" : "rgba(0, 0, 0, 0.7)"}
      p={2}
      style={{
        border: legendary ? "1px solid #ffb35d" : "none",
      }}
    >
      <Text size="10" c="white" fw="bolder" ta="center" lh={0.9}>
        {children}
      </Text>
    </Box>
  );
}
