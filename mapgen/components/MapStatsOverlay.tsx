import { Box, Group, Stack, Text } from "@mantine/core";
import { TechIcon } from "../../app/components/icons/TechIcon";
import { LegendaryIcon } from "../../app/components/icons/LegendaryIcon";

type MapStats = {
  blueTiles: number;
  redTiles: number;
  totalResources: number;
  totalInfluence: number;
  bioticSkips: number;
  warfareSkips: number;
  propulsionSkips: number;
  cyberneticSkips: number;
  redTraits: number;
  greenTraits: number;
  blueTraits: number;
  totalLegendary: number;
};

type Props = {
  stats: MapStats;
  mobile?: boolean;
};

export function MapStatsOverlay({ stats, mobile = false }: Props) {
  return (
    <Stack
      pos={mobile ? "relative" : "absolute"}
      top={mobile ? undefined : 16}
      left={mobile ? undefined : 16}
      gap={1}
      style={{ zIndex: mobile ? undefined : 10 }}
    >
      <Text size="sm" c="gray.0">
        Blue/Red: {stats.blueTiles}/{stats.redTiles}
      </Text>
      <Text size="sm" c="gray.0">
        Resources/Influence: {stats.totalResources}/{stats.totalInfluence}
      </Text>
      <Group gap="xs" align="center">
        <Text size="sm" c="gray.0">
          Tech Skips:
        </Text>
        {(stats.bioticSkips ?? 0) > 0 && (
          <Box
            pos="relative"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <TechIcon techSpecialty="BIOTIC" size={24} />
            <Text
              size="sm"
              fw="bold"
              c="white"
              pos="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {stats.bioticSkips}
            </Text>
          </Box>
        )}
        {(stats.warfareSkips ?? 0) > 0 && (
          <Box
            pos="relative"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <TechIcon techSpecialty="WARFARE" size={24} />
            <Text
              size="sm"
              fw="bold"
              c="white"
              pos="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {stats.warfareSkips}
            </Text>
          </Box>
        )}
        {(stats.propulsionSkips ?? 0) > 0 && (
          <Box
            pos="relative"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <TechIcon techSpecialty="PROPULSION" size={24} />
            <Text
              size="sm"
              fw="bold"
              c="white"
              pos="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {stats.propulsionSkips}
            </Text>
          </Box>
        )}
        {(stats.cyberneticSkips ?? 0) > 0 && (
          <Box
            pos="relative"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <TechIcon techSpecialty="CYBERNETIC" size={24} />
            <Text
              size="sm"
              fw="bold"
              c="white"
              pos="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {stats.cyberneticSkips}
            </Text>
          </Box>
        )}
      </Group>
      {(stats.totalLegendary ?? 0) > 0 && (
        <Group gap="xs" align="center">
          <Text size="sm" c="gray.0">
            Legendaries:
          </Text>
          <Box
            pos="relative"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <LegendaryIcon />
            <Text
              size="sm"
              fw="bold"
              c="white"
              pos="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {stats.totalLegendary}
            </Text>
          </Box>
        </Group>
      )}
      <Text size="sm" c="gray.0">
        Traits R/G/B: {stats.redTraits}/{stats.greenTraits}/{stats.blueTraits}
      </Text>
    </Stack>
  );
}
