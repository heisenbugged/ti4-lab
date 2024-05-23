import { Box, Button, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { useRef } from "react";
import { PlanetFinder } from "~/components/PlanetFinder";
import {
  AvailableFactionsSection,
  ImportMapInput,
  MapSection,
  SlicesSection,
} from "~/components/draft";
import { PlayerInputSection } from "~/components/draft/PlayerInputSection";
import { serializeMap } from "~/data/serialize";
import { useNewDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { PersistedDraft, Player } from "~/types";
import { CreateDraftInput, useCreateDraft } from "./useCreateDraft";

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

  const createDraft = useCreateDraft();
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
      <Button
        onClick={() => {
          createDraft({
            availableFactions: draft.availableFactions,
            mapString: serializeMap(draft.map).join(" "),
            players: draft.players,
            slices: draft.slices,
          });
        }}
      >
        will we submit
      </Button>

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
            mode="create"
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
          <PlayerInputSection
            players={draft.players}
            onChangeName={(playerIdx, name) => {
              draft.updatePlayer(playerIdx, { name });
            }}
          />

          <MapSection
            mode="create"
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

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as CreateDraftInput;

  const draft: PersistedDraft = {
    factions: body.availableFactions,
    mapString: body.mapString,
    slices: body.slices,
    // Pre-fill in player names if they don't exist.
    players: body.players.map((p: Player) => ({
      ...p,
      name: p.name.length > 0 ? p.name : `Player ${p.id}`,
    })),
    currentPick: 0,
    // TODO: Pick order needs to be a proper 'snake draft'
    // that needs to be computed based on the draft options.
    pickOrder: body.players.map((p) => p.id),
  };

  const result = db
    .insert(drafts)
    .values({ data: JSON.stringify(draft) })
    .run();

  return redirect(`/draft/${result.lastInsertRowid}`);
}

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
