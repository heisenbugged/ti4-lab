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
import { useDisclosure } from "@mantine/hooks";
import type { MetaFunction } from "@remix-run/node";
import { useRef, useState } from "react";
import { Map } from "~/components/Map";
import { PlanetFinder } from "~/components/PlanetFinder";
import { Slice } from "~/components/Slice";
import { useDraftStore } from "~/draftStore";
import { useDimensions } from "~/hooks/useDimensions";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function Draft() {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const draft = useDraftStore();
  const hydratedMap = draft.hydratedMap;
  const players = draft.players;

  const gap = 6;
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const height = 7 * calcHexHeight(radius) + 6 * gap;

  const selectedSliceIdx = useRef<number>(-1);
  const selectedTileIdx = useRef<number>(-1);
  const [
    planetFinderOpened,
    { open: openPlanetFinder, close: closePlanetFinder },
  ] = useDisclosure(false);

  return (
    <Box p="lg">
      <PlanetFinder
        opened={planetFinderOpened}
        onClose={() => {
          selectedTileIdx.current = -1;
          selectedSliceIdx.current = -1;
          closePlanetFinder();
        }}
        onSelectSystem={(system) => {
          // TODO: Need a better way to handle if the selection mode is MAP vs TILE
          if (selectedTileIdx.current > -1 && selectedSliceIdx.current === -1) {
            draft.addSystemToMap(selectedTileIdx.current, system);
          } else if (
            selectedTileIdx.current > -1 &&
            selectedSliceIdx.current > -1
          ) {
            draft.addSystemToSlice(
              selectedSliceIdx.current,
              selectedTileIdx.current,
              system,
            );
          }
          closePlanetFinder();
        }}
      />
      {players.length > 0 && (
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
      )}
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        <Stack flex={1} gap="xl">
          <Group
            justify="space-between"
            px="sm"
            py="sm"
            style={{
              borderBottom: "rgba(0,0,0, 0.1) solid 1px",
            }}
          >
            <Title>Slices</Title>
            <Button
              onMouseDown={() => {
                draft.addNewSlice();
              }}
            >
              Add New Slice
            </Button>
          </Group>

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
                onSelectTile={(tileIdx) => {
                  selectedSliceIdx.current = idx;
                  selectedTileIdx.current = tileIdx;
                  openPlanetFinder();
                }}
              />
            ))}
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
            <Group
              justify="space-between"
              px="sm"
              py="sm"
              mb="lg"
              style={{
                borderBottom: "rgba(0,0,0, 0.1) solid 1px",
              }}
            >
              <Title>Full Map</Title>
            </Group>
            <Box
              ref={ref}
              style={{
                height,
                width: "100%",
                position: "relative",
              }}
            >
              <Map
                id="full-map"
                map={hydratedMap}
                padding={0}
                onSelectTile={(tileIdx) => {
                  selectedTileIdx.current = tileIdx;
                  openPlanetFinder();
                }}
              />
            </Box>
          </div>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
