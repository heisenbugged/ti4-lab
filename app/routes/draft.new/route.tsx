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
import { useDraftV2 } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { Draft } from "~/types";
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

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, actions, initialized } = useDraftV2();
  const config = useDraftConfig();
  const settings = useDraftSettings();
  const createDraft = useCreateDraft();

  const validationErrors = useDraftValidationErrors();
  const draftIsValid = validationErrors.length === 0;
  const [
    validationErrorsOpened,
    { close: closeValidationErrors, open: openValidationErrors },
  ] = useDisclosure(false);

  const showFullMap = config.modifiableMapTiles.length > 0;

  useEffect(() => {
    if (location.state == null) return navigate("/draft/prechoice");
    const {
      draftSettings,
      players,
      // TODO re-enable when ready
      // discordData,
    } = location.state;
    actions.initializeDraft(draftSettings, players);

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

      <ImportMapInput onImport={actions.importMap} />

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
  // 4th stage to snake draft if picking speaker order separately
  if (body.settings.draftSpeaker) {
    pickOrder.push(...reversedPlayerIds);
  }

  const draft: Draft = {
    ...body,
    players: body.players.map((p) => ({
      ...p,
      name: p.name.length > 0 ? p.name : `Player ${p.id + 1}`,
    })),
    pickOrder,
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

  // TODO: DISCORD: re-enable when ready
  // if (body.discordData) {
  //   const channel = await getChannel(
  //     body.discordData.guildId,
  //     body.discordData.channelId,
  //   );

  //   await channel?.send(
  //     `Draft has started! Join here: ${global.env.baseUrl}/draft/${prettyUrl}`,
  //   );
  //   await notifyCurrentPick(draft);
  // }

  return redirect(`/draft/${prettyUrl}`);
}
