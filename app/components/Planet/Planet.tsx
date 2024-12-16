import { Box, Flex } from "@mantine/core";
import { Planet as PlanetType, PlanetTrait } from "~/types";
import { PlanetName } from "./PlanetName";
import { PlanetStats } from "./PlanetStats";
import { TechIcon } from "../icons/TechIcon";
import { LegendaryIcon } from "../icons/LegendaryIcon";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export type PlanetFormat =
  | "STREAMLINED"
  | "STREAMLINED_WITH_NAME"
  | "COLORBLIND_FRIENDLY"
  | "COLORBLIND_FRIENDLY_WITH_NAME";

type Props = {
  planet: PlanetType;
  showName?: boolean;
  largeFonts?: boolean;
  hasLegendaryImage?: boolean;
};

export const bgColor: Record<PlanetTrait, string> = {
  CULTURAL: "blue.4",
  HAZARDOUS: "red.5",
  INDUSTRIAL: "green.5",
};

export const accessibleBgColor: Record<PlanetTrait, string> = {
  CULTURAL: "blue.4",
  HAZARDOUS: "rgb(255 40 40)",
  INDUSTRIAL: "green.5",
};

export function Planet({
  planet,
  hasLegendaryImage = false,
  showName = true,
  largeFonts = false,
}: Props) {
  const { accessibleColors } = useSafeOutletContext();
  const bgColors = accessibleColors ? accessibleBgColor : bgColor;
  const { trait, tech: techSpecialty } = planet;

  const fontSize = largeFonts ? "35px" : "24px";
  const size = 50 + (planet.legendary ? 20 : 0);
  const planetColor = trait ? bgColors[trait] : "gray.6";

  return (
    <Flex
      bg={!hasLegendaryImage ? planetColor : undefined}
      style={{ borderRadius: size, width: size, height: size }}
      align="center"
      justify="center"
      pos="relative"
    >
      <PlanetStats
        legendary={planet.legendary}
        resources={planet.resources}
        influence={planet.influence}
        fontSize={fontSize}
      />

      {(showName || planet.legendary) && (
        <PlanetName
          size={size}
          legendary={planet.legendary}
          trait={planet.trait}
        >
          {planet.name}
        </PlanetName>
      )}
      {planet.legendary && (
        <Box pos="absolute" bottom={-4} left={-14}>
          <LegendaryIcon />
        </Box>
      )}
      {techSpecialty && (
        <Box pos="absolute" top={-6} right={-2}>
          <TechIcon techSpecialty={techSpecialty} />
        </Box>
      )}
    </Flex>
  );
}
