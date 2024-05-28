import {
  Box,
  Button,
  Group,
  List,
  Popover,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect, useLocation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { PlanetFinder } from "~/routes/draft.$id/components/PlanetFinder";
import { serializeMap } from "~/data/serialize";
import { useNewDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { MapType, PersistedDraft, Player } from "~/types";
import { CreateDraftInput, useCreateDraft } from "./useCreateDraft";
import { ImportMapInput } from "~/components/ImportMapInput";
import { AvailableFactionsSection } from "./components/AvailableFactionsSection";
import { SlicesSection } from "../draft/SlicesSection";
import { PlayerInputSection } from "./components/PlayerInputSection";
import { MapSection } from "../draft/MapSection";
import { ExportMapModal } from "./components/ExportMapModal";
import { fisherYatesShuffle } from "~/stats";
import { GenerateSlicesModal } from "./components/GenerateSlicesModal";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { v4 as uuidv4 } from "uuid";
import DraftSetup from "./components/DraftSetup";
import { SectionTitle } from "~/components/Section";

export default function DraftNew() {
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

  const [mapExportOpened, { open: openMapExport, close: closeMapExport }] =
    useDisclosure(false);

  const usedSystemIds = [
    draft.slices,
    draft.map
      .filter((t) => t.type === "SYSTEM")
      .map((t) => t.system!!.id.toString()),
  ]
    .flat(2)
    .filter((t) => t !== "-1" && t !== "0");

  const handleCreate = () =>
    createDraft({
      mapType: draft.config.type,
      availableFactions: draft.availableFactions,
      mapString: serializeMap(draft.map).join(" "),
      players: draft.players,
      slices: draft.slices,
      numFactionsToDraft: draft.numFactionsToDraft ?? null,
    });

  const validationErrors = draft.validationErrors();
  const draftIsValid = validationErrors.length === 0;

  const [
    validationErrorsOpened,
    { close: closeValidationErrors, open: openValidationErrors },
  ] = useDisclosure(false);

  const [
    generateSlicesOpened,
    { open: openGenerateSlices, close: closeGenerateSlices },
  ] = useDisclosure(false);

  if (!draft.initialized)
    return (
      <DraftSetup
        players={draft.players}
        onChangeName={(playerIdx, name) => {
          draft.updatePlayer(playerIdx, { name });
        }}
        onSetupComplete={(mapType) => {
          draft.initializeMap(mapType);
        }}
      />
    );

  const showFullMap = draft.config.modifiableMapTiles.length > 0;

  return (
    <Box p="lg">
      <Group
        gap="sm"
        visibleFrom="sm"
        style={{
          position: "fixed",
          bottom: 0,
          right: 10,
          paddingRight: 25,
          zIndex: 100,
          backgroundColor: "white",
          borderTopLeftRadius: 8,
          cursor: "pointer",
          padding: 25,
        }}
      >
        <Button
          variant="outline"
          size="lg"
          color="blue"
          onClick={openMapExport}
        >
          Export
        </Button>
        <Popover
          shadow="md"
          width={300}
          opened={validationErrorsOpened && !draftIsValid}
        >
          <Popover.Target>
            <Button
              size="xl"
              onClick={handleCreate}
              disabled={!draftIsValid}
              onMouseOver={openValidationErrors}
              onMouseLeave={closeValidationErrors}
              style={{
                border: !draftIsValid
                  ? "1px solid var(--mantine-color-red-3)"
                  : undefined,
              }}
            >
              Create Draft
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <List>
              {validationErrors.map((error) => (
                <List.Item key={error}>{error}</List.Item>
              ))}
            </List>
          </Popover.Dropdown>
        </Popover>
      </Group>

      <GenerateSlicesModal
        onClose={closeGenerateSlices}
        onGenerateSlices={draft.randomizeSlices}
        opened={generateSlicesOpened}
      />

      <ExportMapModal
        mapString={draft.exportableMapString()}
        opened={mapExportOpened}
        onClose={closeMapExport}
      />

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

      <AvailableFactionsSection
        numFactions={draft.numFactionsToDraft}
        onChangeNumFactions={draft.setNumFactionsToDraft}
        selectedFactions={draft.availableFactions}
        onToggleFaction={(factionId, checked) => {
          if (checked) {
            draft.addFaction(factionId);
          } else {
            draft.removeFaction(factionId);
          }
        }}
      />
      <Box mt="lg">
        <SlicesSection
          fullView
          config={draft.config}
          mode="create"
          slices={draft.slices}
          onRandomizeSlices={openGenerateSlices}
          onAddNewSlice={draft.addNewSlice}
          onDeleteTile={(sliceIdx, tileIdx) => {
            draft.removeSystemFromSlice(sliceIdx, tileIdx);
          }}
          onSelectTile={(sliceIdx, tileIdx) => {
            openTile.current = {
              mode: "slice",
              sliceIdx,
              tileIdx,
            };
            openPlanetFinder();
          }}
        />
      </Box>

      <SimpleGrid
        cols={{ base: 1, sm: 1, md: 1, lg: 2 }}
        style={{ gap: 30 }}
        mt="50px"
      >
        <Stack flex={1} gap="xl">
          {showFullMap && (
            <MapSection
              mode="create"
              config={draft.config}
              map={draft.map}
              stats={draft.mapStats()}
              onDeleteSystemTile={(tileIdx) => {
                draft.removeSystemFromMap(tileIdx);
              }}
              onSelectSystemTile={(tileIdx) => {
                openTile.current = {
                  mode: "map",
                  sliceIdx: -1,
                  tileIdx,
                };
                openPlanetFinder();
              }}
            />
          )}
        </Stack>
        <Stack flex={1} gap="xs">
          <SectionTitle title="Options" />
          <ImportMapInput onImport={draft.importMap} />
        </Stack>
      </SimpleGrid>

      <Box hiddenFrom="sm">
        <Button
          mt="lg"
          w="100%"
          size="xl"
          onClick={handleCreate}
          disabled={!draftIsValid}
        >
          Create Draft
        </Button>
      </Box>
    </Box>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as CreateDraftInput;

  const playerIds = fisherYatesShuffle(
    body.players.map((p) => p.id),
    body.players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();

  // TODO: Make 'speaker order' pick dynamic. shouldn't be assumed.
  const pickOrder = [
    ...playerIds,
    ...reversedPlayerIds,
    ...playerIds,
    ...reversedPlayerIds,
  ];

  // pull out the factions to draft if specified
  const factions = body.numFactionsToDraft
    ? fisherYatesShuffle(body.availableFactions, body.numFactionsToDraft)
    : body.availableFactions;

  const draft: PersistedDraft = {
    mapType: body.mapType,
    factions,
    mapString: body.mapString,
    slices: body.slices,
    // Pre-fill in player names if they don't exist.
    players: body.players.map((p: Player) => ({
      ...p,
      name: p.name.length > 0 ? p.name : `Player ${p.id + 1}`,
    })),
    currentPick: 0,
    pickOrder,
  };

  const id = uuidv4().toString();
  const result = db
    .insert(drafts)
    .values({
      id,
      data: JSON.stringify(draft),
    })
    .run();

  return redirect(`/draft/${id}`);
}

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
