import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  List,
  Popover,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ActionFunctionArgs } from "react-router";
import { redirect, useLocation, useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { PlanetFinder } from "~/routes/draft.$id/components/PlanetFinder";
import { draftStore, useDraft } from "~/draftStore";
import { Draft } from "~/types";
import { DraftInput, useCreateDraft } from "./useCreateDraft";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SectionTitle } from "~/components/Section";
import { SlicesTable } from "../draft/SlicesTable";
import { createDraft } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import { PlayerInputSection } from "./components/PlayerInputSection";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
} from "./sections";
import { useDraftValidationErrors } from "~/hooks/useDraftValidationErrors";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { notifyPick } from "~/discord/bot.server";
import { AvailableMinorFactionsSection } from "./sections/AvailableMinorFactionsSection";
import { AvailableReferenceCardPacksSection } from "./sections/AvailableReferenceCardPacksSection";
import { ConnectedFactionSettingsModal } from "./components/ConnectedFactionSettingsModal";
import { createDraftOrder } from "~/utils/draftOrder.server";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { systemData } from "~/data/systemData";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, actions, initialized } = useDraft();
  const config = useDraftConfig();

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
  const isTexasStyle = draft.settings.draftGameMode === "texasStyle";
  const isPresetMapDraft = draft.settings.draftGameMode === "presetMap";
  const autoCreatedRef = useRef(false);

  useEffect(() => {
    if (location.state == null) {
      navigate("/draft/prechoice");
      return;
    }

    if (location.state.savedDraftState) {
      const savedState = location.state.savedDraftState;
      actions.initializeDraftFromSavedState(savedState);
      return;
    }

    const { draftSettings, players, discordData } = location.state;
    actions.initializeDraft(draftSettings, players, { discord: discordData });

    const draftState = draftStore.getState();
    if (
      draftSettings.draftGameMode !== "presetMap" &&
      draftState.draft.slices.length === 0
    ) {
      // Analyze why slice generation failed
      const systemPool = draftState.systemPool;
      const settings = draftState.draft.settings;
      const sliceConfig = settings.sliceGenerationConfig;
      
      let errorReason = "Could not generate slices with the given parameters.";
      
      if (sliceConfig) {
        const availableSystems = systemPool.map(id => systemData[id]);
        const alphaCount = availableSystems.filter(system => 
          system.wormholes.includes("ALPHA")
        ).length;
        const betaCount = availableSystems.filter(system => 
          system.wormholes.includes("BETA")
        ).length;
        const legendaryCount = availableSystems.filter(system => 
          system.planets.some(planet => planet.legendary)
        ).length;
        
        const requiredAlphas = sliceConfig.numAlphas ?? 2;
        const requiredBetas = sliceConfig.numBetas ?? 2;
        const requiredLegendaries = sliceConfig.numLegendaries ?? 1;
        
        if (alphaCount < requiredAlphas) {
          errorReason = `Not enough alpha wormholes available. Need ${requiredAlphas}, but only ${alphaCount} are available in the selected game sets.`;
        } else if (betaCount < requiredBetas) {
          errorReason = `Not enough beta wormholes available. Need ${requiredBetas}, but only ${betaCount} are available in the selected game sets.`;
        } else if (legendaryCount < requiredLegendaries) {
          errorReason = `Not enough legendary systems available. Need ${requiredLegendaries}, but only ${legendaryCount} are available in the selected game sets.`;
        } else if (sliceConfig.minOptimal && sliceConfig.maxOptimal) {
          errorReason = `Could not generate slices within the optimal range (${sliceConfig.minOptimal}-${sliceConfig.maxOptimal}). Try adjusting the optimal values.`;
        } else if (sliceConfig.minOptimal) {
          errorReason = `Could not generate slices with minimum optimal value of ${sliceConfig.minOptimal}. Try reducing the minimum optimal value.`;
        } else if (sliceConfig.maxOptimal) {
          errorReason = `Could not generate slices with maximum optimal value of ${sliceConfig.maxOptimal}. Try increasing the maximum optimal value.`;
        }
      }
      
      return navigate("/draft/prechoice", {
        state: { 
          invalidDraftParameters: true,
          errorReason 
        },
      });
    }
      });
      return;
    }

    // a bit hacky, but once we 'consume' the state, we remove it from the history
    window.history.replaceState({ ...window.history.state, usr: null }, "");

    return () => actions?.reset();
  }, []);

  useEffect(() => {
    if (!initialized || !isTexasStyle || autoCreatedRef.current) return;
    if (!draftIsValid) return;
    autoCreatedRef.current = true;
    createDraft(draft);
  }, [initialized, isTexasStyle, draftIsValid, createDraft, draft]);

  const handleCreate = () => createDraft(draft);

  const advancedOptions = (
    <Stack gap="lg">
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
      </Group>
    </Stack>
  );

  if (!initialized) return <LoadingOverlay />;
  if (isTexasStyle) return <LoadingOverlay />;
  if (isPresetMapDraft) {
    return (
      <Flex py="lg" direction="column">
        {draft.integrations.discord && (
          <Box mb="lg">
            <DiscordBanner />
          </Box>
        )}

        <ConnectedFactionSettingsModal />
        <PlanetFinder />

        <Grid style={{ gap: 30 }} mt="lg">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="lg">
              <PlayerInputSection
                players={draft.players}
                discordData={draft.integrations.discord}
                onChangeName={(playerIdx, name) => {
                  actions.updatePlayerName(playerIdx, name);
                }}
              />
              <AvailableReferenceCardPacksSection />
              <AvailableFactionsSection />
              <AvailableMinorFactionsSection />
              {advancedOptions}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <MapSection />
          </Grid.Col>
        </Grid>
      </Flex>
    );
  }

  return (
    <Flex py="lg" direction="column">
      {draft.integrations.discord && (
        <Box mb="lg">
          <DiscordBanner />
        </Box>
      )}

      <ConnectedFactionSettingsModal />

      <PlanetFinder />
      <Box mb="md">
        <OriginalArtToggle showWarning={true} />
      </Box>

      <Stack>
        {draft.settings.draftGameMode !== "texasStyle" && (
          <>
            <AvailableReferenceCardPacksSection />
            <AvailableFactionsSection />
            <AvailableMinorFactionsSection />
          </>
        )}
      </Stack>

      {!isTexasStyle && (
        <Box mt="lg">
          <SlicesSection />
        </Box>
      )}

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
          {showFullMap && !isTexasStyle && <MapSection />}
          {!showFullMap && advancedOptions}
        </Grid.Col>
      </Grid>
    </Flex>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as DraftInput;

  const presetUrl = body.presetUrl;
  delete body.presetUrl;

  const draft: Draft = {
    ...body,
    ...createDraftOrder({
      players: body.players,
      settings: body.settings,
      availableFactions: body.availableFactions,
      presetMap: body.presetMap,
      texasDraft: body.texasDraft,
    }),
  };

  const { prettyUrl, id } = await createDraft(draft, presetUrl);
  if (body.integrations?.discord) {
    await notifyPick(id, prettyUrl, draft);
  }

  return redirect(`/draft/${prettyUrl}`);
}
