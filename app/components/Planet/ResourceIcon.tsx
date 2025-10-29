import { Box, Image, Text } from "@mantine/core";

type Props = {
  value: number;
  size?: number; // total square size in px
};

export function ResourceIcon({ value, size = 20 }: Props) {
  return (
    <Box pos="relative" w={size} h={size} style={{ display: "inline-block" }}>
      <Image src="/pa_resources.png" w={size} h={size} alt="Resources" />
      <Text
        fz="sm"
        fw="bold"
        c="white"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -55%)",
          lineHeight: 1,
        }}
      >
        {value}
      </Text>
    </Box>
  );
}
