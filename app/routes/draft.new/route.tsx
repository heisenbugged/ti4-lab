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
import { useEffect } from "react";
import { PlanetFinder } from "~/routes/draft.$id/components/PlanetFinder";
import { serializeMap } from "~/data/serialize";
import { useDraftV2 } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { PersistedDraft, Player } from "~/types";
import { CreateDraftInput, useCreateDraft } from "./useCreateDraft";
import { ImportMapInput } from "~/components/ImportMapInput";
import { ExportMapModal } from "./components/ExportMapModal";
import { fisherYatesShuffle } from "~/stats";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { v4 as uuidv4 } from "uuid";
import { SectionTitle } from "~/components/Section";
import { SlicesTable } from "../draft/SlicesTable";
import { generateUniquePrettyUrl } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import { getChannel, notifyCurrentPick } from "~/discord/bot.server";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
} from "./sections";
import { useDraftValidationErrors } from "~/hooks/useDraftValidationErrors";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraftSettings } from "~/hooks/useDraftSettings";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const draftV2 = useDraftV2();
  const config = useDraftConfig();
  const settings = useDraftSettings();

  const validationErrors = useDraftValidationErrors();
  const draftIsValid = validationErrors.length === 0;
  const [
    validationErrorsOpened,
    { close: closeValidationErrors, open: openValidationErrors },
  ] = useDisclosure(false);

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

    draftV2.actions.initializeDraft({
      type: mapType,
      numFactions,
      numSlices,
      allowHomePlanetSearch,
      allowEmptyTiles: allowEmptyMapTiles,
      gameSets,
      draftSpeaker,
      randomizeMap,
      randomizeSlices,
    });

    // a bit hacky, but once we 'consume' the state, we remove it from the history
    window.history.replaceState({ ...window.history.state, usr: null }, "");
  }, []);

  const [mapExportOpened, { open: openMapExport, close: closeMapExport }] =
    useDisclosure(false);

  // TODO: Create needs to be adapted.
  const handleCreate = () => {};
  // createDraft({
  //   mapType: config.type,
  //   availableFactions: draftV2.draft.availableFactions,
  //   // TODO: Implement equivalent
  //   // mapString: serializeMap(draft.map).join(" "),
  //   mapString: "",
  //   players: draft.players,
  //   slices: draft.slices,
  //   numFactionsToDraft: draft.numFactionsToDraft ?? null,
  //   draftSpeaker: draft.draftSpeaker,
  //   discordData: draft.discordData ?? null,
  // });

  if (!draftV2.initialized) return <LoadingOverlay />;

  const showFullMap = config.modifiableMapTiles.length > 0;

  const advancedOptions = (
    <Stack gap="lg">
      <SectionTitle title="Advanced Options" />
      <Switch
        checked={settings.draftSpeaker}
        onChange={() => draftV2.actions.setDraftSpeaker(!settings.draftSpeaker)}
        size="md"
        label="Draft Speaker order separately"
        description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
      />

      <ImportMapInput onImport={draftV2.actions.importMap} />

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
      {draftV2.draft.integrations.discord && (
        <Box mb="lg">
          <DiscordBanner />
        </Box>
      )}

      <ExportMapModal
        // TODO: Implement actual map string
        mapString=""
        // mapString={draft.exportableMapString()}
        opened={mapExportOpened}
        onClose={closeMapExport}
      />

      <PlanetFinder />

      <AvailableFactionsSection />
      <Box mt="lg">
        <SlicesSection />
      </Box>

      <Grid style={{ gap: 30 }} mt="50px">
        <Grid.Col
          span={{ base: 12, lg: 6 }}
          order={showFullMap ? { base: 2, lg: 1 } : undefined}
        >
          <Stack gap="xl" w="100%">
            <Stack gap="xs">
              <SectionTitle title="Slices Summary" />
              <SlicesTable slices={draftV2.draft.slices} />
            </Stack>
            {showFullMap && advancedOptions}
          </Stack>
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, lg: 6 }}
          order={showFullMap ? { base: 1, lg: 2 } : undefined}
        >
          {showFullMap && <MapSection />}
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
