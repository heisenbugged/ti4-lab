import { Box, Text, useMantineTheme } from "@mantine/core";
import { PlanetTrait } from "~/types";

type Props = {
  trait?: PlanetTrait[];
  children: string;
  size: number;
  legendary?: boolean;
};

const getBgColor = (
  traitColor: Record<PlanetTrait, string>,
  traits: PlanetTrait[],
) => {
  if (traits.length === 1) {
    return traitColor[traits[0]];
  }

  const total = traits.length;
  let currentPos = 0;
  const stops = [];

  for (const trait of traits) {
    const percentage = 100 / total;
    stops.push(`${traitColor[trait]} ${currentPos}%`);
    stops.push(`${traitColor[trait]} ${currentPos + percentage}%`);
    currentPos += percentage;
  }

  return `linear-gradient(to right, ${stops.join(", ")})`;
};

export function PlanetName({
  size,
  children,
  trait,
  legendary = false,
}: Props) {
  const theme = useMantineTheme();

  const traitColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[9],
    HAZARDOUS: theme.colors.red[9],
    INDUSTRIAL: theme.colors.green[9],
  };

  const traitBorderColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[6],
    HAZARDOUS: theme.colors.red[6],
    INDUSTRIAL: theme.colors.green[6],
  };

  const bgColor = trait ? getBgColor(traitColor, trait) : "#d27900";
  const borderColor = trait ? getBgColor(traitBorderColor, trait) : "#d27900";
  let borderStyle = {};
  if (legendary && trait) {
    if (trait.length === 1) {
      borderStyle = { border: `2px solid ${borderColor}` };
    } else if (trait.length > 1) {
      borderStyle = {
        borderWidth: `2px`,
        borderStyle: `solid`,
        borderImage: `${borderColor} 1`,
      };
    }
  }
  return (
    <Box
      pos="absolute"
      top={size - 10}
      right={0}
      left={0}
      bg={legendary ? bgColor : "rgba(0, 0, 0, 0.7)"}
      p={2}
      style={borderStyle}
    >
      <Text size="10" c="white" fw="bolder" ta="center" lh={0.9}>
        {children}
      </Text>
    </Box>
  );
}
