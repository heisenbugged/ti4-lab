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
import { Draft } from "~/types";
import { DraftInput, useCreateDraft } from "./useCreateDraft";
import { ExportMapModal } from "./components/ExportMapModal";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SectionTitle } from "~/components/Section";
import { SlicesTable } from "../draft/SlicesTable";
import { createDraft } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
} from "./sections";
import { useDraftValidationErrors } from "~/hooks/useDraftValidationErrors";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraftSettings } from "~/hooks/useDraftSettings";
import { getChannel, notifyPick } from "~/discord/bot.server";
import { AvailableMinorFactionsSection } from "./sections/AvailableMinorFactionsSection";
import { FactionSettingsModal } from "./components/FactionSettingsModal";
import { createDraftOrder } from "~/utils/draftOrder.server";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";

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

    if (location.state.savedDraftState) {
      const savedState = location.state.savedDraftState;
      actions.initializeDraftFromSavedState(savedState);
      return;
    }

    const { draftSettings, players, discordData } = location.state;
    actions.initializeDraft(draftSettings, players, { discord: discordData });

    if (draftStore.getState().draft.slices.length === 0) {
      return navigate("/draft/prechoice", {
        state: { invalidDraftParameters: true },
      });
    }

    // a bit hacky, but once we 'consume' the state, we remove it from the history
    window.history.replaceState({ ...window.history.state, usr: null }, "");

    return () => actions?.reset();
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
    <Flex py="lg" direction="column">
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
      <Box mb="md">
        <OriginalArtToggle showWarning={true} />
      </Box>

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

  const draft: Draft = {
    ...body,
    ...createDraftOrder(body.players, body.settings, body.availableFactions),
  };

  const { prettyUrl, id } = await createDraft(draft);
  if (body.integrations?.discord) {
    await notifyPick(id, prettyUrl, draft);
  }

  return redirect(`/draft/${prettyUrl}`);
}
