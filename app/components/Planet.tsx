import { Box, Flex, Group, Text } from "@mantine/core";
import { Planet, PlanetTrait, TechSpecialty } from "~/types";

export type PlanetFormat =
  | "STREAMLINED"
  | "STREAMLINED_WITH_NAME"
  | "COLORBLIND_FRIENDLY"
  | "COLORBLIND_FRIENDLY_WITH_NAME";

type Props = {
  planet: Planet;
  showName?: boolean;
  largeFonts?: boolean;
};

const techAbbreviations: Record<TechSpecialty, string> = {
  BIOTIC: "G",
  WARFARE: "R",
  PROPULSION: "B",
  CYBERNETIC: "Y",
};

const bgColor: Record<PlanetTrait, string> = {
  CULTURAL: "blue.4",
  HAZARDOUS: "red.4",
  INDUSTRIAL: "green.5",
};

export function Planet({ planet, showName = true, largeFonts = false }: Props) {
  const { trait, techSpecialty } = planet;

  // ok instead of using traitAbbreviations just grab the first letter of the trait
  const traitAbbr = trait ? trait[0] : "";
  const traitClass = trait ? trait.toLowerCase() : "";

  const techClass = techSpecialty ? techSpecialty.toLowerCase() : "";
  const techAbbr = techSpecialty ? techAbbreviations[techSpecialty] : "";

  // TODO: Come up with a better way of handling this lol.
  // should have it in the actual data.
  const isLegendary = planet.name === "Primor" || planet.name === "Hope's End";
  const legendaryClass = isLegendary ? " legendary" : "";

  const fontSize = largeFonts ? "35" : "24";
  const size = 50;
  return (
    <Flex
      bg={trait ? bgColor[trait] : "gray.5"}
      style={{ borderRadius: size, width: size, height: size }}
      align="center"
      justify="center"
      pos="relative"
    >
      <Group gap={3}>
        <Text size={fontSize} fw="bolder" style={{ color: "yellow" }} lh={0}>
          {planet.resources}
        </Text>
        <Text size={fontSize} c="blue.9" fw="bolder" lh={0}>
          {planet.influence}
        </Text>
      </Group>
      {showName && (
        <Box
          pos="absolute"
          top={50 - 10}
          right={0}
          left={0}
          bg="rgba(0, 0, 0, 0.7)"
          p={2}
        >
          <Text size="10" c="white" fw="bolder" ta="center" lh={0.9}>
            {planet.name}
          </Text>
        </Box>
      )}
    </Flex>
  );
}
