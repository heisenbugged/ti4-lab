import {
  Box,
  Divider,
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
  "59 33 64 71 29 62 0 30 0 32 0 26 0 69 0 27 0 20 -1 0 0 -1 0 0 -1 0 0 -1 0 0 -1 0 0 -1 0 0";
const map = {
  tiles: [MECATOL_TILE, ...parseMapString(mapString).tiles],
};

const players: Player[] = [
  {
    id: "abc",
    name: "James",
    faction: "mentak",
    seat: 0,
    sliceIdx: 0,
  },
  {
    id: "def",
    name: "Steven",
    faction: "yssaril",
    seat: 1,
    sliceIdx: 1,
  },
  {
    id: "def",
    name: "Joe",
    faction: "yssaril",
    seat: 2,
    sliceIdx: 2,
  },
  {
    id: "def",
    name: "Jim",
    faction: "yssaril",
    seat: 3,
    sliceIdx: 3,
  },
  {
    id: "def",
    name: "Jan",
    faction: "yssaril",
    seat: 4,
    sliceIdx: 4,
  },
  {
    id: "def",
    name: "Jen",
    faction: "yssaril",
    seat: 5,
    sliceIdx: 5,
  },
];

const draft: TDraft = {
  players,
  slices: [
    "0 30 23 37",
    "0 38 42 70",
    "0 43 71 72",
    "0 61 62 67",
    "0 43 71 72",
    "0 61 62 67",
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
    <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }}>
      <Stack flex={1} p="lg">
        <Title>Slices</Title>
        <SimpleGrid
          flex={1}
          cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
          spacing="lg"
        >
          {draft.slices.map((slice, idx) => (
            <Slice
              key={idx}
              id={`slice-${idx}`}
              name={`Slice ${idx + 1}`}
              mapString={slice}
              player={players.find((p) => p.sliceIdx === idx)}
            />
          ))}
        </SimpleGrid>
      </Stack>
      <Stack flex={1} p="lg" pos="relative">
        <div style={{ position: "sticky", width: "auto", top: 25 + 30 + 5 }}>
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
  );
}
