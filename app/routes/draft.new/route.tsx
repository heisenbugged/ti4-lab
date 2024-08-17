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
import { draftStore, useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { Draft, FactionId, PlayerId } from "~/types";
import { DraftInput, useCreateDraft } from "./useCreateDraft";
import { ImportMapInput } from "~/components/ImportMapInput";
import { ExportMapModal } from "./components/ExportMapModal";
import { fisherYatesShuffle } from "~/stats";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { v4 as uuidv4 } from "uuid";
import { SectionTitle } from "~/components/Section";
import { SlicesTable } from "../draft/SlicesTable";
import { generateUniquePrettyUrl } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
} from "./sections";
import { useDraftValidationErrors } from "~/hooks/useDraftValidationErrors";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraftSettings } from "~/hooks/useDraftSettings";
import { getChannel, notifyCurrentPick } from "~/discord/bot.server";
import { shuffle } from "~/draft/helpers/randomization";
import { AvailableMinorFactionsSection } from "./sections/AvailableMinorFactionsSection";
import { FactionSettingsModal } from "./components/FactionSettingsModal";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, actions, initialized } = useDraft();
  const config = useDraftConfig();
  const settings = useDraftSettings();
  const createDraft = useCreateDraft();

  const validationErrors = useDraftValidationErrors();
  const draftIsValid = validationErrors.length === 0;
  const [
    validationErrorsOpened,
    { close: closeValidationErrors, open: openValidationErrors },
  ] = useDisclosure(false);

  const showFullMap =
    config.modifiableMapTiles.length > 0 ||
    Object.keys(config.presetTiles).length > 0;

  useEffect(() => {
    if (location.state == null) return navigate("/draft/prechoice");
    const { draftSettings, players, discordData } = location.state;
    actions.initializeDraft(draftSettings, players, { discord: discordData });

    if (draftStore.getState().draft.slices.length === 0) {
      return navigate("/draft/prechoice", {
        state: { invalidDraftParameters: true },
      });
    }

    // a bit hacky, but once we 'consume' the state, we remove it from the history
    window.history.replaceState({ ...window.history.state, usr: null }, "");
  }, []);

  const [mapExportOpened, { open: openMapExport, close: closeMapExport }] =
    useDisclosure(false);

  const handleCreate = () => createDraft(draft);

  if (!initialized) return <LoadingOverlay />;

  const advancedOptions = (
    <Stack gap="lg">
      <SectionTitle title="Advanced Options" />
      <Switch
        checked={settings.draftSpeaker}
        onChange={() => actions.setDraftSpeaker(!settings.draftSpeaker)}
        size="md"
        label="Draft Speaker order separately"
        description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
      />

      {/* TODO: Re-enable when ready */}
      {/* <ImportMapInput onImport={actions.importMap} /> */}

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
      {draft.integrations.discord && (
        <Box mb="lg">
          <DiscordBanner />
        </Box>
      )}

      <FactionSettingsModal />

      <ExportMapModal
        // TODO: Implement actual map string
        mapString=""
        // mapString={draft.exportableMapString()}
        opened={mapExportOpened}
        onClose={closeMapExport}
      />

      <PlanetFinder />

      <Stack>
        <AvailableFactionsSection />
        <AvailableMinorFactionsSection />
      </Stack>

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
              <SlicesTable slices={draft.slices} />
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
  const body = (await request.json()) as DraftInput;

  const playerIds = fisherYatesShuffle(
    body.players.map((p) => p.id),
    body.players.length,
  );
  const reversedPlayerIds = [...playerIds].reverse();
  const pickOrder = [...playerIds, ...reversedPlayerIds, ...playerIds];
  // add stage to snake draft if picking speaker order separately
  if (body.settings.draftSpeaker) {
    pickOrder.push(...playerIds.reverse());
  }

  // add stage to snake draft if picking minor factions separately
  if (
    body.settings.numMinorFactions !== undefined ||
    body.settings.minorFactionsInSharedPool
  ) {
    pickOrder.push(...playerIds.reverse());
  }

  // add stage to snake draft if picking player colors separately
  if (body.settings.draftPlayerColors) {
    pickOrder.push(...playerIds.reverse());
  }

  // if using bag draft, create the 'bags' for each player
  let playerFactionPool: Record<PlayerId, FactionId[]> | undefined = undefined;
  if (body.settings.numPreassignedFactions !== undefined) {
    playerFactionPool = {};
    const available = shuffle(body.availableFactions);
    body.players.forEach((player) => {
      const bag = available.splice(0, body.settings.numPreassignedFactions);
      playerFactionPool![player.id] = bag;
    });
  }

  const draft: Draft = {
    ...body,
    players: body.players.map((p) => ({
      ...p,
      name: p.name.length > 0 ? p.name : `Player ${p.id + 1}`,
    })),
    pickOrder,
    playerFactionPool,
  };

  const prettyUrl = await generateUniquePrettyUrl();
  // TODO: Handle error if insert fails
  db.insert(drafts)
    .values({
      id: uuidv4().toString(),
      urlName: prettyUrl,
      data: JSON.stringify(draft),
    })
    .run();

  if (body.integrations?.discord) {
    const discord = body.integrations.discord;
    const channel = await getChannel(discord.guildId, discord.channelId);
    await channel?.send(
      `Draft has started! Join here: ${global.env.baseUrl}/draft/${prettyUrl}`,
    );
    await notifyCurrentPick(draft);
  }

  return redirect(`/draft/${prettyUrl}`);
}
