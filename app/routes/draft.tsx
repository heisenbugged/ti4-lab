import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Map } from "~/components/Map";
import { Slice } from "~/components/Slice";

import { useDimensions } from "~/hooks/useDimensions";
import { Draft as TDraft, Player, Tile } from "~/types";
import { MECATOL_TILE, hydrateMap, parseMapString } from "~/utils/map";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

const mapString =
  "26 19 75 66 33 25 0 67 0 35 0 62 0 78 0 74 0 44 -1 0 0 -1 0 0 -1 0 0 -1 0 0 -1 0 0 -1 0 0".split(
    " ",
  );

const map = {
  tiles: [MECATOL_TILE, ...parseMapString(mapString).tiles],
};

const players: Player[] = [
  {
    id: "abc",
    name: "James",
    faction: "mentak",
    seat: 5,
    sliceIdx: 0,
  },
  {
    id: "def",
    name: "Steven",
    faction: "yssaril",
    // seat: 1,
    // sliceIdx: 1,
  },
  {
    id: "def",
    name: "Joe",
    faction: "yssaril",
    // seat: 2,
    // sliceIdx: 2,
  },
  {
    id: "def",
    name: "Jim",
    faction: "yssaril",
    // seat: 3,
    // sliceIdx: 3,
  },
  {
    id: "def",
    name: "Jan",
    faction: "yssaril",
    // seat: 4,
    // sliceIdx: 4,
  },
  {
    id: "def",
    name: "Jen",
    faction: "yssaril",
    // seat: 5,
    // sliceIdx: 5,
  },
];

const draft: TDraft = {
  players,
  slices: [
    ["-1", "76", "79", "61"],
    ["-1", "39", "48", "23"],
    ["-1", "31", "32", "30"],
    // ["-1", "38", "60", "64"],
    // ["-1", "37", "63", "73"],
    // ["-1", "40", "22", "36"],
  ],
};

export default function Draft() {
  const { ref, width } = useDimensions<HTMLDivElement>();

  const gap = 6;
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const height = 7 * calcHexHeight(radius) + 6 * gap;

  // extract this functionality to a function. hydrateMapTiles(map, draft)
  const hydratedMap = hydrateMap(map, draft);

  return (
    <Box p="lg">
      <Stack gap="sm" mb="60">
        <Title>Draft Order</Title>
        <Group gap={1}>
          {players.map((player, idx) => (
            <Box
              key={player.id}
              bg={idx === 3 ? "violet.7" : "gray.5"}
              px="md"
              py="xs"
            >
              <Title order={3} c={idx === 3 ? "white" : "gray.8"} lh={1}>
                {player.name}
              </Title>
            </Box>
          ))}
          {players.reverse().map((player) => (
            <Box key={`${player.id}-2`} bg="gray.5" px="md" py="xs">
              <Title order={3} c="gray.8" lh={1}>
                {player.name}
              </Title>
            </Box>
          ))}
        </Group>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        <Stack flex={1} gap="xl">
          <Title>Slices</Title>
          <SimpleGrid
            flex={1}
            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
            spacing="lg"
            style={{
              alignItems: "flex-start",
            }}
          >
            {draft.slices.map((slice, idx) => (
              <Slice
                key={idx}
                id={`slice-${idx}`}
                name={`Slice ${idx + 1}`}
                systems={slice}
                player={players.find((p) => p.sliceIdx === idx)}
              />
            ))}

            <Flex
              // bg="gray.1"
              h="100%"
              align="center"
              justify="center"
              style={{ borderRadius: 8, border: "3px dashed #e1e1e1" }}
            >
              <Button>Add New Slice</Button>
            </Flex>
          </SimpleGrid>
        </Stack>
        <Stack flex={1} pos="relative">
          <div
            style={{
              position: "sticky",
              width: "auto",
              top: 25 + 30 + 5,
            }}
          >
            <Title>Full Map</Title>
            <Box
              ref={ref}
              style={{
                height,
                width: "100%",
                position: "relative",
              }}
            >
              <Map id="full-map" map={hydratedMap} padding={0} />
            </Box>
          </div>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
