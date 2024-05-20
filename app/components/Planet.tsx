import { Box, Flex, Group, Text } from "@mantine/core";
import { Planet as PlanetType, PlanetTrait, TechSpecialty } from "~/types";
import { PlanetName } from "./PlanetName";
import { PlanetStats } from "./PlanetStats";
import { TechIcon } from "./features/TechIcon";

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

export const bgColor: Record<PlanetTrait, string> = {
  CULTURAL: "blue.4",
  HAZARDOUS: "red.5",
  INDUSTRIAL: "green.5",
};

export function Planet({ planet, showName = true, largeFonts = false }: Props) {
  const { trait, techSpecialty } = planet;

  // TODO: Come up with a better way of handling this lol.
  // should have it in the actual data.
  const isLegendary = planet.name === "Primor" || planet.name === "Hope's End";
  // const legendaryClass = isLegendary ? " legendary" : "";

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
      <PlanetStats
        resources={planet.resources}
        influence={planet.influence}
        fontSize={fontSize}
      />

      {showName && (
        <PlanetName legendary={isLegendary}>{planet.name}</PlanetName>
      )}
      {techSpecialty && (
        <Box pos="absolute" top={-6} right={-2}>
          <TechIcon techSpecialty={techSpecialty} />
        </Box>
      )}
    </Flex>
  );
}
