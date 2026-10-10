import { IconDeviceFloppy, IconPlayerPlay } from "@tabler/icons-react";
import type { ActionFunctionArgs } from "react-router";
import { redirect, useLocation, useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { PlanetFinder } from "~/routes/draft.$id/components/PlanetFinder";
import { draftStore, useDraft } from "~/draftStore";
import { Draft } from "~/types";
import { DraftInput, useCreateDraft } from "./useCreateDraft";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { SlicesTable } from "../draft/SlicesTable";
import { createDraft } from "~/drizzle/draft.server";
import { DiscordBanner } from "~/components/DiscordBanner";
import { PlayerInputSection } from "./components/PlayerInputSection";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
  PlayersSection,
} from "./sections";
import { useDraftValidationErrors } from "~/hooks/useDraftValidationErrors";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { notifyPick } from "~/discord/notify.server";
import { AvailableMinorFactionsSection } from "./sections/AvailableMinorFactionsSection";
import { AvailableReferenceCardPacksSection } from "./sections/AvailableReferenceCardPacksSection";
import { ConnectedFactionSettingsModal } from "./components/ConnectedFactionSettingsModal";
import { withDraftOrder } from "~/utils/draftOrder.server";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { SaveDraftPresetModal } from "./components/SaveDraftPresetModal";
import { BuilderSection } from "./sections/BuilderSection";
import { MAPS } from "~/routes/draft.prechoice/maps";
import { Button, Code, Heading, Text, useDisclosure } from "~/ui";
import classes from "./route.module.css";

export default function DraftNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, actions, initialized } = useDraft();
  const config = useDraftConfig();

  const createDraft = useCreateDraft();

  const validationErrors = useDraftValidationErrors();
  const draftIsValid = validationErrors.length === 0;
  const [savePresetOpened, { close: closeSavePreset, open: openSavePreset }] =
    useDisclosure(false);

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

    if (
      draftSettings.draftGameMode !== "presetMap" &&
      draftStore.getState().draft.slices.length === 0
    ) {
      navigate("/draft/prechoice", {
        state: { invalidDraftParameters: true },
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
    <div className={classes.createColumn}>
      <section className={classes.createBox} aria-label="Create draft">
        <Button
          variant="primary"
          size="lg"
          block
          icon={<IconPlayerPlay />}
          onClick={handleCreate}
          disabled={!draftIsValid}
          aria-describedby={draftIsValid ? undefined : "draft-errors"}
        >
          Create draft
        </Button>
        {!draftIsValid && (
          <div className={classes.errors} id="draft-errors" role="status">
            <b>
              Fix {validationErrors.length}{" "}
              {validationErrors.length === 1 ? "thing" : "things"} to create
              the draft
            </b>
            <ul>
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className={classes.saveBox}>
        <Heading variant="heading" as="h3">
          Save for later
        </Heading>
        <Text size="sm" tone="muted">
          Save this map, slices and settings as a named preset. Continue from
          it later in TI4 Lab, or start it in Discord with{" "}
          <Code>/labdraft preset:&lt;name&gt;</Code>.
        </Text>
        <Button
          icon={<IconDeviceFloppy />}
          disabled={!draftIsValid}
          onClick={openSavePreset}
        >
          Save as preset
        </Button>
      </section>
    </div>
  );

  const formatName = isPresetMapDraft
    ? "Preset map"
    : draft.settings.draftGameMode === "twilightsFall"
      ? "Twilight's Fall"
      : (MAPS[draft.settings.type]?.title ?? draft.settings.type);

  const header = (
    <header className={classes.head}>
      <div className={classes.headText}>
        <Heading variant="title" as="h1">
          Review your draft
        </Heading>
        <Text size="sm" tone="muted">
          {formatName}, {draft.players.length} players. Reroll, edit or remove
          anything, then create the draft.
        </Text>
      </div>
      {!isPresetMapDraft && <OriginalArtToggle showWarning={true} />}
    </header>
  );

  const modals = (
    <>
      <ConnectedFactionSettingsModal />
      <SaveDraftPresetModal
        draft={draft}
        opened={savePresetOpened}
        onClose={closeSavePreset}
      />
      <PlanetFinder />
    </>
  );

  if (!initialized) return <LoadingOverlay />;
  if (isTexasStyle) return <LoadingOverlay />;
  if (isPresetMapDraft) {
    return (
      <div className={classes.page}>
        {draft.integrations.discord && <DiscordBanner />}
        {modals}
        {header}

        <div className={classes.presetLayout}>
          <div className={classes.column}>
            <BuilderSection
              title="Players"
              meta={`${draft.players.length} players`}
            >
              <PlayerInputSection
                showHeader={false}
                players={draft.players}
                discordData={draft.integrations.discord}
                onChangeName={(playerIdx, name) => {
                  actions.updatePlayerName(playerIdx, name);
                }}
              />
            </BuilderSection>
            <AvailableReferenceCardPacksSection />
            <AvailableFactionsSection />
            <AvailableMinorFactionsSection />
            {advancedOptions}
          </div>
          <div className={classes.mapColumn}>
            <MapSection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      {draft.integrations.discord && <DiscordBanner />}
      {modals}
      {header}

      <PlayersSection />
      <AvailableReferenceCardPacksSection />
      <AvailableFactionsSection />
      <AvailableMinorFactionsSection />
      <SlicesSection />

      <div
        className={classes.bottom}
        data-full-map={showFullMap || undefined}
      >
        <div className={classes.column}>
          <BuilderSection title="Slices summary">
            <SlicesTable slices={draft.slices} />
          </BuilderSection>
          {showFullMap && advancedOptions}
        </div>
        <div className={classes.side}>
          {showFullMap ? <MapSection /> : advancedOptions}
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as DraftInput;

  const presetUrl = body.presetUrl;
  delete body.presetUrl;

  const draft: Draft = withDraftOrder(body);

  const { prettyUrl, id } = await createDraft(draft, presetUrl);
  if (body.integrations?.discord) {
    await notifyPick(id, prettyUrl, draft);
  }

  return redirect(`/draft/${prettyUrl}`);
}
