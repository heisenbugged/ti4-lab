import { Box, Text, lighten, useMantineTheme } from "@mantine/core";
import { PlanetTrait } from "~/types";

type Props = {
  trait?: PlanetTrait;
  children: string;
  size: number;
  legendary?: boolean;
};

export function PlanetName({
  size,
  children,
  trait,
  legendary = false,
}: Props) {
  const theme = useMantineTheme();

  const traitColor: Record<PlanetTrait, string> = {
    CULTURAL: "blue.9",
    HAZARDOUS: "red.9",
    INDUSTRIAL: "green.9",
  };

  const traitBorderColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[6],
    HAZARDOUS: theme.colors.red[6],
    INDUSTRIAL: theme.colors.green[6],
  };

  const bgColor = trait ? traitColor[trait] : "#d27900";
  const borderColor = trait ? traitBorderColor[trait] : "#d27900";
  return (
    <Box
      pos="absolute"
      top={size - 10}
      right={0}
      left={0}
      bg={legendary ? bgColor : "rgba(0, 0, 0, 0.7)"}
      p={2}
      style={{
        border: legendary ? `2px solid ${borderColor}` : "none",
      }}
    >
      <Text size="10" c="white" fw="bolder" ta="center" lh={0.9}>
        {children}
      </Text>
    </Box>
  );
}
