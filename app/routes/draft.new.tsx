import { Box, Group, Input, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { PlanetFinder } from "~/components/PlanetFinder";
import {
  AvailableFactionsSection,
  ImportMapInput,
  MapSection,
  SlicesSection,
} from "~/components/draft";
import { Section, SectionTitle } from "~/components/draft/Section";
import { useNewDraft } from "~/draftStore";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

export default function DraftNew() {
  // Example of socket, to be put on actual draft page.
  // const socket = useSocket();
  // useEffect(() => {
  //   if (!socket) return;
  //   socket.on("event", (data) => {
  //     debugger;
  //     console.log(data);
  //   });
  //   socket.emit("event", "ping");
  // }, [socket]);

  const draft = useNewDraft();
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

  const usedSystemIds = [
    draft.slices,
    draft.map.tiles
      .filter((t) => t.type === "SYSTEM")
      .map((t) => t.system!!.id.toString()),
  ]
    .flat(2)
    .filter((t) => t !== "-1" && t !== "0");

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

          if (mode === "map") draft.addSystemToMap(tileIdx, system);
          if (mode === "slice" && sliceIdx > -1) {
            draft.addSystemToSlice(sliceIdx, tileIdx, system);
          }

          closePlanetFinder();
        }}
        usedSystemIds={usedSystemIds}
      />

      <button type="button" onClick={() => socket?.emit("event", "ping")}>
        Send ping
      </button>

      <ImportMapInput onImport={draft.importMap} />

      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <Stack flex={1} gap="xl">
          <AvailableFactionsSection
            selectedFactions={draft.availableFactions}
            onToggleFaction={(factionId, checked) => {
              if (checked) {
                draft.addFaction(factionId);
              } else {
                draft.removeFaction(factionId);
              }
            }}
          />
          <SlicesSection
            slices={draft.slices}
            onAddNewSlice={draft.addNewSlice}
            onSelectTile={(sliceIdx, tileIdx) => {
              openTile.current = {
                mode: "slice",
                sliceIdx,
                tileIdx,
              };
              openPlanetFinder();
            }}
          />
        </Stack>
        <Stack flex={1} gap="xl">
          <Section>
            <SectionTitle title="Player Names" />
            <Stack>
              {[0, 1, 2, 3, 4, 5].map((seatIdx) => (
                <Group>
                  <img
                    src={`/avatar/avatar${seatIdx}.png`}
                    style={{ width: 60 }}
                  />
                  <Input
                    key={seatIdx}
                    placeholder={`Player ${seatIdx + 1}`}
                    flex={1}
                    size="lg"
                    // value={draft.players[seatIdx].name}
                    // onChange={(e) => draft.setPlayerName(seatIdx, e.currentTarget.value)}
                  />
                </Group>
              ))}
            </Stack>
          </Section>

          <MapSection
            map={draft.map}
            onSelectSystemTile={(tileIdx) => {
              openTile.current = {
                mode: "map",
                sliceIdx: -1,
                tileIdx,
              };
              openPlanetFinder();
            }}
          />
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
