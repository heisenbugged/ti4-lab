import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { MapConfig, mapConfig } from "~/utils/map";
import { MapType, OpenTile, PlayerDemoTile } from "~/types";
import { useState } from "react";
import { mapStringOrder } from "~/data/mapStringOrder";
import { DemoMap } from "~/components/DemoMap";
import { useNavigate } from "@remix-run/react";

type PrechoiceMap = {
  title: string;
  description: string;
  map: (PlayerDemoTile | OpenTile)[];
  titles: string[];
  colors: string[];
};

const MAPS: Record<MapType, PrechoiceMap> = {
  heisen: {
    title: "Heisen",
    description:
      "Players draft the systems immediately adjacent to their home system. Speaker order and seat selection are separate parts of the draft.",
    map: parseDemoMapString(
      mapConfig.heisen,
      "1 -1 -1 -1 -1 -1 -1 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["P1", "P2", "P3", "P4", "P5", "P6"],
    colors: [
      "var(--mantine-color-blue-2)",
      "var(--mantine-color-green-2)",
      "var(--mantine-color-red-2)",
      "var(--mantine-color-purple-2)",
      "var(--mantine-color-yellow-2)",
      "var(--mantine-color-orange-2)",
    ],
  },
  miltyeq: {
    title: "Milty EQ",
    description:
      "The classic, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board.",
    map: parseDemoMapString(
      mapConfig.miltyeq,
      "1 1 2 3 4 5 6 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["5th", "6th", "Speaker", "2nd", "3rd", "4th"],
    colors: [
      "var(--mantine-color-blue-2)",
      "var(--mantine-color-green-2)",
      "var(--mantine-color-red-2)",
      "var(--mantine-color-purple-2)",
      "var(--mantine-color-yellow-2)",
      "var(--mantine-color-orange-2)",
    ],
  },
  miltyeqless: {
    title: "Milty EQ (less)",
    description:
      "Milty-EQ, but with empty equidistant systems. Sandbox for new TI4 content",
    map: parseDemoMapString(
      mapConfig.miltyeq,
      "1 1 2 3 4 5 6 1 -2 2 -2 3 -2 4 -2 5 -2 6 -2 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["5th", "6th", "Speaker", "2nd", "3rd", "4th"],
    colors: [
      "var(--mantine-color-blue-2)",
      "var(--mantine-color-green-2)",
      "var(--mantine-color-red-2)",
      "var(--mantine-color-purple-2)",
      "var(--mantine-color-yellow-2)",
      "var(--mantine-color-orange-2)",
    ],
  },
  milty: {
    title: "Milty",
    description:
      "The O.G. draft format. Slices include the left equidistant system, and no preset tiles are on the board.",
    map: parseDemoMapString(
      mapConfig.milty,
      "1 1 2 3 4 5 6 1 1 2 2 3 3 4 4 5 5 6 6 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["6th", "Speaker", "2nd", "3rd", "4th", "5th"],
    colors: [
      "var(--mantine-color-blue-2)",
      "var(--mantine-color-green-2)",
      "var(--mantine-color-red-2)",
      "var(--mantine-color-purple-2)",
      "var(--mantine-color-yellow-2)",
      "var(--mantine-color-orange-2)",
    ],
  },
};

export default function Prechoice() {
  const [hoveredMapType, setHoveredMapType] = useState<MapType | undefined>();
  const [selectedMapType, setSelectedMapType] = useState<MapType>("heisen");
  const mapType = hoveredMapType ?? selectedMapType;
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate(`/draft/new?mapType=${mapType}`);
  };

  return (
    <Group w="100%" h="calc(100vh - 60px)" align="stretch" gap={60}>
      <Box
        bg="gray.1"
        style={{
          borderRight: "1px rgb(0,0,0,0.1) solid",
          paddingRight: 15,
          marginLeft: -14,
        }}
        px="md"
        pt="lg"
      >
        <Stack gap="md" onMouseLeave={() => setHoveredMapType(undefined)}>
          <Title mb="xl">Choose draft style</Title>
          {Object.entries(MAPS).map(([type, { title }]) => (
            <Button
              color="blue"
              size="xl"
              variant={selectedMapType === type ? "filled" : "outline"}
              ff="heading"
              miw={350}
              onMouseOver={() => setHoveredMapType(type as MapType)}
              onMouseDown={() => setSelectedMapType(type as MapType)}
            >
              {title}
            </Button>
          ))}

          <Button
            size="lg"
            disabled={!selectedMapType}
            w="100%"
            onMouseDown={handleContinue}
          >
            Continue
          </Button>
        </Stack>
      </Box>
      <Stack flex={1} pos="relative" align="center">
        <Box pos="relative" flex={1} w="100%" mt="sm" miw="450px">
          {mapType && (
            <DemoMap
              id="prechoice-map"
              map={MAPS[mapType].map}
              titles={MAPS[mapType].titles}
              colors={MAPS[mapType].colors}
              padding={0}
            />
          )}
        </Box>
        <Text size="xl" m="xl" maw="500px" ta="center">
          {MAPS[mapType].description}
        </Text>
      </Stack>
    </Group>
  );
}

function parseDemoMapString(config: MapConfig, mapString: string[]) {
  const tiles = mapString.map((player, idx) => {
    const position = mapStringOrder[idx];
    const isHomeSystem = config.homeIdxInMapString.includes(idx);

    if (player === "-1") {
      return {
        idx,
        position,
        type: "OPEN",
      } as OpenTile;
    }

    return {
      idx,
      position,
      isHomeSystem,
      playerNumber: parseInt(player) - 1,
      type: "PLAYER_DEMO",
      system: undefined,
    } as PlayerDemoTile;
  });
  return tiles;
}
