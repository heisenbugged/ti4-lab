import {
  Box,
  Button,
  Group,
  Input,
  SimpleGrid,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { MetaFunction } from "@remix-run/node";
import { ReactNode, useRef, useState } from "react";
import { Map } from "~/components/Map";
import { PlanetFinder } from "~/components/PlanetFinder";
import { Slice } from "~/components/Slice";
import { FactionIcon } from "~/components/features/FactionIcon";
import { factions } from "~/data/factionData";
import { useDraftStore } from "~/draftStore";
import { useDimensions } from "~/hooks/useDimensions";
import { mapConfig } from "~/utils/map";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function Draft() {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const draftStore = useDraftStore();
  const draft = draftStore.draft;
  const hydratedMap = draft.hydratedMap;
  const players = draft.players;

  const gap = 6;
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const height = 7 * calcHexHeight(radius) + 6 * gap;

  const openTile = useRef<{
    mode: "map" | "slice";
    sliceIdx: number;
    tileIdx: number;
  }>({
    mode: "map",
    sliceIdx: -1,
    tileIdx: -1,
  });
  const [
    planetFinderOpened,
    { open: openPlanetFinder, close: closePlanetFinder },
  ] = useDisclosure(false);

  const activePlayer = 1;
  const usedSystemIds = [
    draft.slices,
    draft.hydratedMap.tiles
      .filter((t) => t.type === "SYSTEM")
      .map((t) => t.system!!.id.toString()),
  ]
    .flat(2)
    .filter((t) => t !== "-1" && t !== "0");

  const [importableMap, setImportableMap] = useState<string>("");

  return (
    <Box p="lg">
      <PlanetFinder
        opened={planetFinderOpened}
        onClose={() => {
          openTile.current = {
            mode: "map",
            sliceIdx: -1,
            tileIdx: -1,
          };
          closePlanetFinder();
        }}
        onSelectSystem={(system) => {
          if (!openTile.current) return;
          const { mode, sliceIdx, tileIdx } = openTile.current;

          if (mode === "map") draftStore.addSystemToMap(tileIdx, system);
          if (mode === "slice" && sliceIdx > -1) {
            draftStore.addSystemToSlice(sliceIdx, tileIdx, system);
          }

          closePlanetFinder();
        }}
        usedSystemIds={usedSystemIds}
      />

      <Group mb="lg">
        <Input
          flex={1}
          size="md"
          placeholder="Map String to Import"
          onChange={(e) => setImportableMap(e.currentTarget.value)}
        />
        <Button
          onClick={() => {
            draftStore.importMap(importableMap);
          }}
        >
          Import
        </Button>
      </Group>

      {players.length > 0 && (
        <Stack gap="sm" mb="60">
          <Title order={2}>Draft Order</Title>
          <Group gap={1}>
            {players.map((player, idx) => (
              <Box
                key={player.id}
                bg={idx === 3 ? "violet.7" : "gray.5"}
                px="md"
                py="xs"
              >
                <Title order={5} c={idx === 3 ? "white" : "gray.8"} lh={1}>
                  {player.name}
                </Title>
              </Box>
            ))}
            {[...players].reverse().map((player) => (
              <Box key={`${player.id}-2`} bg="gray.5" px="md" py="xs">
                <Title order={5} c="gray.8" lh={1}>
                  {player.name}
                </Title>
              </Box>
            ))}
          </Group>
        </Stack>
      )}
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        <Stack flex={1} gap="xl">
          <SectionTitle title="Speaker Order" />
          <SimpleGrid cols={6}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Stack
                bg="gray.1"
                align="center"
                gap="sm"
                p="sm"
                style={{
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <Title order={5} ta="center" flex={1}>
                  Position {idx}
                </Title>
                <Button key={idx} size="sm">
                  Select
                </Button>
              </Stack>
            ))}
          </SimpleGrid>

          <Stack flex={1} gap="xl">
            <SectionTitle title="Faction" />
            <SimpleGrid cols={5}>
              {draft.factions.map((factionId) => (
                <Stack
                  bg="gray.1"
                  align="center"
                  gap="sm"
                  p="sm"
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <FactionIcon faction={factionId} style={{ width: 30 }} />
                  <Title order={5} ta="center" flex={1}>
                    {factions[factionId].name}
                  </Title>
                  <Button key={factionId} size="sm">
                    Select
                  </Button>
                </Stack>
              ))}
            </SimpleGrid>
          </Stack>

          <SectionTitle title="Slices">
            {/* Re-enable for draft editor */}
            {/* <Button onMouseDown={() => draftStore.addNewSlice()}>
              Add New Slice
            </Button> */}
          </SectionTitle>
          <SimpleGrid
            flex={1}
            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {draft.slices.map((slice, idx) => (
              <Slice
                key={idx}
                id={`slice-${idx}`}
                name={`Slice ${idx + 1}`}
                systems={slice}
                player={players.find((p) => p.sliceIdx === idx)}
                onSelectTile={(tile) => {
                  openTile.current = {
                    mode: "slice",
                    sliceIdx: idx,
                    tileIdx: tile.idx,
                  };
                  openPlanetFinder();
                }}
                onSelectSlice={() => {
                  draftStore.selectSlice(activePlayer, idx);
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
              top: -10,
            }}
          >
            <SectionTitle title="Full Map" />
            <Box
              ref={ref}
              style={{
                height,
                width: "100%",
                position: "relative",
              }}
              mt="md"
            >
              <Map
                id="full-map"
                map={hydratedMap}
                padding={0}
                onSelectSystemTile={(tileIdx) => {
                  openTile.current = {
                    mode: "map",
                    sliceIdx: -1,
                    tileIdx,
                  };
                  openPlanetFinder();
                }}
                onSelectHomeTile={(tile) =>
                  draftStore.selectSeat(activePlayer, tile.seatIdx)
                }
              />
            </Box>
          </div>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}

function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <Group
      justify="space-between"
      px="sm"
      py="sm"
      style={{
        borderBottom: "rgba(0,0,0, 0.1) solid 1px",
      }}
    >
      <Title order={2}>{title}</Title>
      {children}
    </Group>
  );
}
