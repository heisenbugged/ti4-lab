import { LoaderFunction, redirect } from "@remix-run/node";
import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Input,
  Stack,
  Stepper,
  Switch,
  Text,
} from "@mantine/core";
import { MapConfig, mapConfig } from "~/utils/map";
import { EmptyTile, MapType, OpenTile, Player, PlayerDemoTile } from "~/types";
import { useState } from "react";
import { mapStringOrder } from "~/data/mapStringOrder";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "./draft.new/components/PlayerInputSection";
import { useNavigate } from "@remix-run/react";

type PrechoiceMap = {
  title: string;
  description: string;
  map: (PlayerDemoTile | OpenTile | EmptyTile)[];
  titles: string[];
  colors: string[];
};

const MAPS: Record<MapType, PrechoiceMap> = {
  heisen: {
    title: "Nucleus",
    description:
      "A new draft format featuring a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order.",
    map: parseDemoMapString(
      mapConfig.heisen,
      "-2 -1 -1 -1 -1 -1 -1 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
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
      "-2 1 2 3 4 5 6 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
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
    title: "Milty xEQ",
    description:
      "Milty-EQ, but with empty equidistant systems. Sandbox for new TI4 content",
    map: parseDemoMapString(
      mapConfig.miltyeq,
      "-2 1 2 3 4 5 6 1 -2 2 -2 3 -2 4 -2 5 -2 6 -2 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
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
      "-2 1 2 3 4 5 6 1 1 2 2 3 3 4 4 5 5 6 6 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
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

export default function DraftPrechoice() {
  const navigate = useNavigate();
  const [hoveredMapType, setHoveredMapType] = useState<MapType | undefined>();
  const [selectedMapType, setSelectedMapType] = useState<MapType>("heisen");
  const [numFactions, setNumFactions] = useState<string>("");
  const [numSlices, setNumSlices] = useState<string>("");
  const [randomizeSlices, setRandomizeSlices] = useState<boolean>(true);
  const [randomizeMap, setRandomizeMap] = useState<boolean>(true);
  const [players, setPlayers] = useState<Player[]>([
    ...[0, 1, 2, 3, 4, 5].map((i) => ({
      id: i,
      name: "",
    })),
  ]);

  const mapType = hoveredMapType ?? selectedMapType;
  const config = selectedMapType ? mapConfig[selectedMapType] : undefined;
  const showRandomizeMapTiles = config
    ? config.modifiableMapTiles.length > 0
    : true;

  const handleChangeName = (playerIdx: number, name: string) => {
    setPlayers((players) =>
      players.map((player) =>
        player.id === playerIdx ? { ...player, name } : player,
      ),
    );
  };
  const handleContinue = () => {
    console.log("randomizeMap is", randomizeMap);
    navigate("/draft/new", {
      state: {
        mapType: selectedMapType,
        numFactions: Number(numFactions),
        numSlices: Number(numSlices),
        randomizeSlices,
        randomizeMap,
        players,
      },
    });
  };

  const hasValidFactions = Number(numFactions) >= 6;
  const hasValidSlices = Number(numSlices) >= 6;

  return (
    <Grid mt="lg">
      <Grid.Col span={{ base: 12, sm: 7 }}>
        <Flex align="center" justify="center" direction="column">
          <Box w="100%">
            <SectionTitle title="Draft style" />
          </Box>
          <Group
            gap="md"
            onMouseLeave={() => setHoveredMapType(undefined)}
            mt="lg"
            mb="lg"
            w="100%"
            align="center"
            justify="center"
          >
            {Object.entries(MAPS).map(([type, { title }]) => (
              <Button
                key={type}
                color="blue"
                size="xl"
                variant={selectedMapType === type ? "filled" : "outline"}
                ff="heading"
                onMouseOver={() => setHoveredMapType(type as MapType)}
                onMouseDown={() => setSelectedMapType(type as MapType)}
              >
                {title}
              </Button>
            ))}
          </Group>
          <Box pos="relative" w="80%" maw="700px" mt="sm">
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
          <Text size="md" mt="xl" maw="700px" ta="center" c="gray.7">
            {MAPS[mapType].description}
          </Text>
        </Flex>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 5 }}>
        <Stack gap="xl">
          <PlayerInputSection
            players={players}
            onChangeName={handleChangeName}
          />
          <Stack>
            <SectionTitle title="Configuration" />
            <Input.Wrapper
              label="# of Factions"
              description="The number factions available for the draft. Recommended is player count + 3. Can be changed during draft building."
              error={
                numFactions.length > 0 && !hasValidFactions
                  ? "Must be at least 6"
                  : null
              }
            >
              <Input
                placeholder="9"
                value={numFactions}
                type="number"
                onChange={(e) => {
                  if (e.currentTarget.value.length === 0) {
                    setNumFactions("");
                    return;
                  }
                  setNumFactions(e.currentTarget.value);
                }}
                error={numFactions.length > 0 && !hasValidFactions}
              />
            </Input.Wrapper>

            <Input.Wrapper
              label="# of Slices"
              description="The number of slices that will be available for the draft. Can be changed during draft building."
              error={
                numSlices.length > 0 && !hasValidSlices
                  ? "Must be at least 6"
                  : null
              }
            >
              <Input
                placeholder="9"
                value={numSlices}
                type="number"
                onChange={(e) => {
                  if (e.currentTarget.value.length === 0) {
                    setNumSlices("");
                    return;
                  }
                  setNumSlices(e.currentTarget.value);
                }}
                error={numSlices.length > 0 && !hasValidSlices}
              />
            </Input.Wrapper>

            <Switch
              label="Randomize slices"
              description="Prepopulate the slices with random systems. Setting can be changed during draft building. All slices are manually editable."
              checked={randomizeSlices}
              onChange={() => setRandomizeSlices((v) => !v)}
            />

            <Switch
              label="Randomize Map Tiles"
              description="Prepopulate the map with random systems. All map systems are manually editable."
              checked={randomizeMap}
              onChange={() => setRandomizeMap((v) => !v)}
              disabled={!showRandomizeMapTiles}
            />
          </Stack>
          <Button
            size="lg"
            w="100%"
            onMouseDown={handleContinue}
            disabled={!hasValidFactions || !hasValidSlices}
          >
            Continue
          </Button>
        </Stack>
      </Grid.Col>
    </Grid>
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

    if (player === "-2") {
      return {
        idx,
        position,
        type: "EMPTY",
      } as EmptyTile;
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

export let loader: LoaderFunction = async () => {
  // return redirect("/draft/new");
  return null;
};
