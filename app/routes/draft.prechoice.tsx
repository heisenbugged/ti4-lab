import { LoaderFunction } from "@remix-run/node";
import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Input,
  Slider,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { EmptyTile, OpenTile, Player, PlayerDemoTile } from "~/types";
import { useState } from "react";
import { mapStringOrder } from "~/data/mapStringOrder";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "./draft.new/components/PlayerInputSection";
import { useNavigate } from "@remix-run/react";
import { DraftConfig, DraftType, draftConfig } from "~/draft";

import "../components/draftprechoice.css";

type PrechoiceMap = {
  title: string;
  description: string;
  map: (PlayerDemoTile | OpenTile | EmptyTile)[];
  titles: string[];
  colors: string[];
};

const MAPS: Record<DraftType, PrechoiceMap> = {
  heisen: {
    title: "Nucleus",
    description:
      "A new draft format featuring a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order.",
    map: parseDemoMapString(
      draftConfig.heisen,
      "-2 -1 -1 -1 -1 -1 -1 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1"
        .split(" ")
        .map(Number),
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
      draftConfig.miltyeq,
      "-2 1 2 3 4 5 6 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1"
        .split(" ")
        .map(Number),
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
      draftConfig.miltyeq,
      "-2 1 2 3 4 5 6 1 -2 2 -2 3 -2 4 -2 5 -2 6 -2 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1"
        .split(" ")
        .map(Number),
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
      draftConfig.milty,
      "-2 1 2 3 4 5 6 1 1 2 2 3 3 4 4 5 5 6 6 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1"
        .split(" ")
        .map(Number),
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
  wekker: {
    title: "Wekker",
    description: "Chaotic but strategic.",
    map: parseDemoMapString(
      draftConfig.miltyeq,
      "-2 6 1 2 3 4 5 1 1 2 2 3 3 4 4 5 5 6 6 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1 1"
        .split(" ")
        .map(Number),
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
  const [hoveredMapType, setHoveredMapType] = useState<DraftType | undefined>();
  const [selectedMapType, setSelectedMapType] = useState<DraftType>("heisen");
  const [numFactions, setNumFactions] = useState(6);
  const [numSlices, setNumSlices] = useState(6);
  const [randomizeSlices, setRandomizeSlices] = useState<boolean>(true);
  const [randomizeMap, setRandomizeMap] = useState<boolean>(true);
  const [players, setPlayers] = useState<Player[]>([
    ...[0, 1, 2, 3, 4, 5].map((i) => ({
      id: i,
      name: "",
    })),
  ]);

  const mapType = hoveredMapType ?? selectedMapType;
  const config = selectedMapType ? draftConfig[selectedMapType] : undefined;
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
    navigate("/draft/new", {
      state: {
        mapType: selectedMapType,
        numFactions: Number(numFactions),
        numSlices: Number(numSlices),
        randomizeSlices,
        randomizeMap,
        players,
        draftSpeaker: config?.type === "heisen",
      },
    });
  };

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
                onMouseOver={() => setHoveredMapType(type as DraftType)}
                onMouseDown={() => setSelectedMapType(type as DraftType)}
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
            >
              <Slider
                min={6}
                max={25}
                step={1}
                labelAlwaysOn
                className="withBottomLabel"
                onChange={(value) => setNumFactions(value)}
                value={numFactions}
              />
            </Input.Wrapper>

            <Input.Wrapper
              label="# of Slices"
              description="The number of slices that will be available for the draft. Can be changed during draft building."
            >
              <Slider
                min={6}
                max={9}
                step={1}
                labelAlwaysOn
                className="withBottomLabel"
                onChange={(value) => setNumSlices(value)}
                value={numSlices}
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
          <Button size="lg" w="100%" onMouseDown={handleContinue}>
            Continue
          </Button>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

function parseDemoMapString(config: DraftConfig, mapString: number[]) {
  const tiles = mapString.map((player, idx) => {
    const position = mapStringOrder[idx];
    const isHomeSystem = config.homeIdxInMapString.includes(idx);

    if (player === -1) {
      return {
        idx,
        position,
        type: "OPEN",
      } as OpenTile;
    }

    if (player === -2) {
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
      playerNumber: player - 1,
      type: "PLAYER_DEMO",
      system: undefined,
    } as PlayerDemoTile;
  });
  return tiles;
}

export const loader: LoaderFunction = async () => {
  // return redirect("/draft/new");
  return null;
};
