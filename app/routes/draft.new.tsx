import {
  Box,
  Button,
  Checkbox,
  Group,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { MetaFunction } from "@remix-run/node";
import { ReactNode, useRef, useState } from "react";
import { Map } from "~/components/Map";
import { NewDraftFaction } from "~/components/NewDraftFaction";
import { PlanetFinder } from "~/components/PlanetFinder";
import { Slice } from "~/components/Slice";
import { FactionIcon } from "~/components/features/FactionIcon";
import { factions } from "~/data/factionData";
import { useDraftStore } from "~/draftStore";
import { useDimensions } from "~/hooks/useDimensions";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draftz" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function DraftNew() {
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

      <Group>
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
      <Text size="sm" c="gray.7" mb="xl">
        Copy paste in a map string, and we will populate the relevant slices.
        Alternatively, you can click on a tile to add a system to either a map
        or a slice.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        <Stack flex={1} gap="xl">
          <Stack flex={1} gap="xl">
            <SectionTitle title="Available Factions">
              <Group>
                <Text>Number of factions in draft:</Text>
                <Input
                  placeholder="6 or 9 or 12 etc"
                  size="sm"
                  type="number"
                  min={6}
                />
              </Group>
            </SectionTitle>
            <SimpleGrid cols={4}>
              {Object.keys(factions).map((factionId) => (
                <NewDraftFaction
                  key={factionId}
                  faction={factions[factionId]}
                />
              ))}
            </SimpleGrid>
          </Stack>

          <SectionTitle title="Slices">
            <Button onMouseDown={() => draftStore.addNewSlice()}>
              Add New Slice
            </Button>
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
                mode="create"
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
                  console.log("selecting", idx);
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
                mode="create"
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
        borderBottom: "var(--mantine-color-spaceBlue-1) solid 1px",
        background:
          "linear-gradient(90deg, var(--mantine-color-spaceBlue-1) 0%, #ffffff 50%)",
      }}
      // bg="spaceBlue.1"
    >
      <Title order={2}>{title}</Title>
      {children}
    </Group>
  );
}
