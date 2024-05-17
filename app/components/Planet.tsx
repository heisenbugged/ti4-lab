import { Box, Flex, Group, Text } from "@mantine/core";
import { Planet as PlanetType, PlanetTrait, TechSpecialty } from "~/types";

export type PlanetFormat =
  | "STREAMLINED"
  | "STREAMLINED_WITH_NAME"
  | "COLORBLIND_FRIENDLY"
  | "COLORBLIND_FRIENDLY_WITH_NAME";

type Props = {
  planet: PlanetType;
  showName?: boolean;
  largeFonts?: boolean;
};

const bgColor: Record<PlanetTrait, string> = {
  CULTURAL: "blue.4",
  HAZARDOUS: "red.4",
  INDUSTRIAL: "green.5",
};

const techIcon: Record<TechSpecialty, string> = {
  BIOTIC: "/biotic.webp",
  CYBERNETIC: "/cybernetic.webp",
  WARFARE: "/warfare.webp",
  PROPULSION: "/propulsion.webp",
};

export function Planet({ planet, showName = true, largeFonts = false }: Props) {
  const { trait, techSpecialty } = planet;

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
      {techSpecialty && (
        <Box pos="absolute" top={-6} right={-2}>
          <img
            src={techIcon[techSpecialty]}
            style={{ width: 20, height: 20 }}
          />
        </Box>
      )}
    </Flex>
  );
}
