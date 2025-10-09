import { Box, Flex, useMantineTheme } from "@mantine/core";
import { Planet as PlanetType, PlanetTrait } from "~/types";
import { PlanetName } from "./PlanetName";
import { PlanetStats } from "./PlanetStats";
import { TechIcon } from "../icons/TechIcon";
import { LegendaryIcon } from "../icons/LegendaryIcon";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { TradeStationIcon } from "~/components/icons/TradeStationIcon";
import { TradeStation } from "../features/TradeStation";
import { LegendaryPopover } from "./LegendaryPopover";

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

const getBgColor = (
  bgColors: Record<PlanetTrait, string>,
  traits: PlanetTrait[],
) => {
  if (traits.length === 1) {
    return bgColors[traits[0]];
  }

  const total = traits.length;
  let currentPos = 0;
  const stops = [];

  for (const trait of traits) {
    const percentage = 100 / total;
    stops.push(`${bgColors[trait]} ${currentPos}%`);
    stops.push(`${bgColors[trait]} ${currentPos + percentage}%`);
    currentPos += percentage;
  }

  return `linear-gradient(to right, ${stops.join(", ")})`;
};

export function Planet({
  planet,
  hasLegendaryImage = false,
  showName = true,
  largeFonts = false,
}: Props) {
  const { accessibleColors } = useSafeOutletContext();
  const theme = useMantineTheme();

  const bgColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[4],
    HAZARDOUS: theme.colors.red[5],
    INDUSTRIAL: theme.colors.green[5],
  };

  const accessibleBgColor: Record<PlanetTrait, string> = {
    CULTURAL: theme.colors.blue[4],
    HAZARDOUS: "rgb(255 40 40)",
    INDUSTRIAL: theme.colors.green[5],
  };

  const bgColors = accessibleColors ? accessibleBgColor : bgColor;
  const { trait, tech: techSpecialty } = planet;

  const fontSize = largeFonts ? "35px" : "24px";
  const size = 50 + (planet.legendary ? 20 : 0);
  const planetColor = trait ? getBgColor(bgColors, trait) : "gray.6";

  const showBg = !hasLegendaryImage && !planet.tradeStation;

  const content = (
    <Flex
      bg={showBg ? planetColor : undefined}
      style={{ borderRadius: size, width: size, height: size }}
      align="center"
      justify="center"
      pos="relative"
    >
      {planet.tradeStation && (
        <Box
          pos="absolute"
          bottom="4px"
          style={{
            transform: "rotate(-20deg)",
          }}
        >
          <TradeStation />
        </Box>
      )}
      <PlanetStats
        legendary={planet.legendary || planet.tradeStation}
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

      {techSpecialty?.map((tech, index) => (
        <Box key={index} pos="absolute" top={-6} right={-2 + 20 * index}>
          <TechIcon techSpecialty={tech} />
        </Box>
      ))}
    </Flex>
  );

  return planet.legendary ||
    planet.legendaryTitle ||
    planet.legendaryDescription ? (
    <LegendaryPopover
      title={planet.legendaryTitle}
      description={planet.legendaryDescription}
    >
      {content}
    </LegendaryPopover>
  ) : (
    content
  );
}
