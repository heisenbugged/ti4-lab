import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Group,
  List,
  Popover,
  Stack,
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ActionFunctionArgs } from "@remix-run/node";
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
import { generateUniquePrettyUrl } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import { getChannel, notifyCurrentPick } from "~/discord/bot.server";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const draft = useNewDraft();

  useEffect(() => {
    if (location.state == null) return navigate("/draft/prechoice");
    const {
      gameSets,
      mapType,
      numFactions,
      numSlices,
      players,
      randomizeSlices,
      randomizeMap,
      draftSpeaker,
      allowHomePlanetSearch,
      allowEmptyMapTiles,
      discordData,
    } = location.state;

    draft.actions.initializeMap({
      gameSets,
      mapType,
      numFactions,
      numSlices,
      players,
      randomizeSlices,
      randomizeMap,
      draftSpeaker,
      allowHomePlanetSearch,
      allowEmptyMapTiles,
      discordData,
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
    draft.map.filter((t) => t.type === "SYSTEM").map((t) => t.system!.id),
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
      discordData: draft.discordData ?? null,
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
        onChange={() => draft.actions.setDraftSpeaker(!draft.draftSpeaker)}
        size="md"
        label="Draft Speaker order separately"
        description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
      />

      <ImportMapInput onImport={draft.actions.importMap} />

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

        <Button
          onClick={openMapExport}
          variant="outline"
          size="xl"
          color="blue"
        >
          Export Map
        </Button>
      </Group>
    </Stack>
  );

  return (
    <Flex p="lg" direction="column">
      {draft.discordData && (
        <Box mb="lg">
          <DiscordBanner />
        </Box>
      )}
      <GenerateSlicesModal
        defaultNumSlices={draft.slices.length}
        onClose={closeGenerateSlices}
        onGenerateSlices={draft.actions.randomizeSlices}
        opened={generateSlicesOpened}
      />

      <ExportMapModal
        mapString={draft.exportableMapString()}
        opened={mapExportOpened}
        onClose={closeMapExport}
      />

      <PlanetFinder
        factionPool={draft.factionPool}
        availableSystemIds={draft.systemPool}
        allowHomePlanetSearch={draft.allowHomePlanetSearch}
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

          if (mode === "map") draft.actions.addSystemToMap(tileIdx, system);
          if (mode === "slice" && sliceIdx > -1) {
            draft.actions.addSystemToSlice(sliceIdx, tileIdx, system);
          }

          closePlanetFinder();
        }}
        usedSystemIds={usedSystemIds}
      />

      <AvailableFactionsSection
        factionPool={draft.factionPool}
        numFactions={draft.numFactionsToDraft}
        selectedFactions={draft.availableFactions}
        onToggleFaction={(factionId, checked) => {
          if (checked) {
            draft.actions.addFaction(factionId);
          } else {
            draft.actions.removeFaction(factionId);
          }
        }}
        onRemoveFaction={draft.actions.removeLastFaction}
        onAddFaction={draft.actions.addRandomFaction}
        onRandomizeFactions={draft.actions.randomizeFactions}
      />
      <Box mt="lg">
        <SlicesSection
          fullView
          config={draft.config}
          mode="create"
          slices={draft.slices}
          onRandomizeSlices={() => {
            if (draft.config.type === "heisen")
              return draft.actions.randomizeAll();

            if (draft.config.generateSlices) {
              draft.actions.randomizeSlices();
            } else {
              openGenerateSlices();
            }
          }}
          onAddNewSlice={draft.actions.addNewSlice}
          onDeleteTile={(sliceIdx, tileIdx) => {
            draft.actions.removeSystemFromSlice(sliceIdx, tileIdx);
          }}
          onSelectTile={(sliceIdx, tileIdx) => {
            openTile.current = {
              mode: "slice",
              sliceIdx,
              tileIdx,
            };
            openPlanetFinder();
          }}
          onClearSlice={draft.actions.clearSlice}
          onRandomizeSlice={draft.actions.randomizeSlice}
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
                draft.actions.removeSystemFromMap(tileIdx);
              }}
              onSelectSystemTile={(tileIdx) => {
                openTile.current = {
                  mode: "map",
                  sliceIdx: -1,
                  tileIdx,
                };
                openPlanetFinder();
              }}
              onClearMap={draft.actions.clearMap}
              // do not allow map randomization with heisen
              // as the map is carefully constructed in tandem with slices
              // and we do not want to upset that balance.
              onRandomizeMap={
                draft.config.type !== "heisen"
                  ? draft.actions.randomizeMap
                  : undefined
              }
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
    discordData: body.discordData ?? undefined,
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
  const prettyUrl = await generateUniquePrettyUrl();
  // TODO: Handle error if insert fails
  db.insert(drafts)
    .values({
      id,
      urlName: prettyUrl,
      data: JSON.stringify(draft),
    })
    .run();

  if (body.discordData) {
    const channel = await getChannel(
      body.discordData.guildId,
      body.discordData.channelId,
    );

    await channel?.send(
      `Draft has started! Join here: ${global.env.baseUrl}/draft/${prettyUrl}`,
    );
    await notifyCurrentPick(draft);
  }

  return redirect(`/draft/${prettyUrl}`);
}
