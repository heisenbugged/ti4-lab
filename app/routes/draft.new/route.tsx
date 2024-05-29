import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Group,
  List,
  Popover,
  SimpleGrid,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { PlanetFinder } from "~/routes/draft.$id/components/PlanetFinder";
import { serializeMap } from "~/data/serialize";
import { useNewDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { PersistedDraft, Player } from "~/types";
import { CreateDraftInput, useCreateDraft } from "./useCreateDraft";
import { ImportMapInput } from "~/components/ImportMapInput";
import { AvailableFactionsSection } from "./components/AvailableFactionsSection";
import { SlicesSection } from "../draft/SlicesSection";
import { MapSection } from "../draft/MapSection";
import { ExportMapModal } from "./components/ExportMapModal";
import { fisherYatesShuffle } from "~/stats";
import { GenerateSlicesModal } from "./components/GenerateSlicesModal";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { v4 as uuidv4 } from "uuid";
import { SectionTitle } from "~/components/Section";
import { SlicesTable } from "../draft/SlicesTable";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const draft = useNewDraft();

  useEffect(() => {
    if (location.state == null) return navigate("/draft/prechoice");
    const {
      mapType,
      numFactions,
      numSlices,
      players,
      randomizeSlices,
      randomizeMap,
    } = location.state;

    draft.initializeMap({
      mapType,
      numFactions,
      numSlices,
      players,
      randomizeSlices,
      randomizeMap,
    });

    // a bit hacky, but once we 'consume' the state, we remove it from the history
    window.history.replaceState({ ...window.history.state, usr: null }, "");
  }, []);

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
      draftSpeaker: draft.draftSpeaker,
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

  if (!draft.initialized) return <LoadingOverlay />;

  const showFullMap = draft.config.modifiableMapTiles.length > 0;

  const advancedOptions = (
    <Stack gap="lg">
      <SectionTitle title="Advanced Options" />
      <Switch
        checked={draft.draftSpeaker}
        onChange={() => draft.setDraftSpeaker(!draft.draftSpeaker)}
        size="md"
        label="Draft Speaker order separately"
        description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
      />

      <ImportMapInput onImport={draft.importMap} />

      <Divider mt="md" mb="md" />
      <Group gap="sm">
        <Popover shadow="md" opened={validationErrorsOpened && !draftIsValid}>
          <Popover.Target>
            <Button
              flex={1}
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
              Create
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

        <Button onClick={openMapExport} variant="outline" size="xl" c="blue">
          Export Map
        </Button>
      </Group>
    </Stack>
  );

  return (
    <Flex p="lg" direction="column">
      <GenerateSlicesModal
        defaultNumSlices={draft.slices.length}
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
        onRemoveFaction={draft.removeLastFaction}
        onAddFaction={draft.addRandomFaction}
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
          onClearSlice={draft.clearSlice}
          onRandomizeSlice={draft.randomizeSlice}
        />
      </Box>

      <Grid style={{ gap: 30 }} mt="50px">
        <Grid.Col
          span={{ base: 12, lg: 6 }}
          order={showFullMap ? { base: 2, lg: 1 } : undefined}
        >
          <Stack gap="xl" w="100%">
            <Stack gap="xs">
              <SectionTitle title="Slices Summary" />
              <SlicesTable slices={draft.slices} />
            </Stack>
            {showFullMap && advancedOptions}
          </Stack>
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, lg: 6 }}
          order={showFullMap ? { base: 1, lg: 2 } : undefined}
        >
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
              onClearMap={draft.clearMap}
              onRandomizeMap={draft.randomizeMap}
            />
          )}
          {!showFullMap && advancedOptions}
        </Grid.Col>
      </Grid>
    </Flex>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as CreateDraftInput;

  const playerIds = fisherYatesShuffle(
    body.players.map((p) => p.id),
    body.players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();

  const pickOrder = [...playerIds, ...reversedPlayerIds, ...playerIds];
  // 4th stage to snake draft if picking speaker order separately
  if (body.draftSpeaker) {
    pickOrder.push(...reversedPlayerIds);
  }

  // pull out the factions to draft if specified
  const factions = body.numFactionsToDraft
    ? fisherYatesShuffle(body.availableFactions, body.numFactionsToDraft)
    : body.availableFactions;

  const draft: PersistedDraft = {
    mapType: body.mapType,
    factions,
    mapString: body.mapString,
    slices: body.slices,
    draftSpeaker: body.draftSpeaker,
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
