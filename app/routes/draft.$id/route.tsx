import { Button, Grid, Stack, Text } from "@mantine/core";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { useSocket } from "~/socketContext";
import { Draft } from "~/types";
import { CurrentPickBanner } from "./components/CurrentPickBanner";
import { PlayerSelectionScreen } from "./components/PlayerSelectionScreen";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
  updateDraft,
} from "~/drizzle/draft.server";
import { notifyPick } from "~/discord/bot.server";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import {
  SlicesSection,
  SpeakerOrderSection,
  DraftOrderSection,
  DraftableFactionsSection,
  MapSection,
  DraftSummarySection,
} from "./sections";
import { PlanetFinder } from "./components/PlanetFinder";
import { useNotifyActivePlayer } from "~/hooks/useNotifyActivePlayer";
import { FinalizedDraft } from "./components/FinalizedDraft";
import { SyncDraftContext, useSyncDraftFetcher } from "~/hooks/useSyncDraft";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { DraftableMinorFactionsSection } from "./sections/DraftableMinorFactionsSection";
import { DraftablePlayerColorsSection } from "./sections/DraftablePlayerColorsSection";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { BanPhase } from "./sections/BanPhase";

export default function RunningDraft() {
  const { adminMode } = useSafeOutletContext();
  useNotifyActivePlayer();
  const result = useLoaderData<typeof loader>();
  const { syncDraft, syncing } = useSyncDraftFetcher();
  const draftStore = useDraft();
  const draft = draftStore.draft;
  const settings = draft.settings;
  const draftActions = draftStore.draftActions;
  const selectedPlayer = draftStore.selectedPlayer;
  const { draftFinished } = useHydratedDraft();

  // Real-time socket connection to push and receive state updates.
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    // join draft on every connect
    // this way if there's a disconnection, a reconnection will rejoin the draft
    socket.on("connect", () => {
      socket.emit("joinDraft", result.id);
    });
    socket.on("syncDraft", (data) => {
      const draft = JSON.parse(data) as Draft;
      draftStore.draftActions.update(result.id!, draft);
    });
  }, [socket]);

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draftStore.draftActions.hydrate(result.id!, result.urlName!, result.data);

    const storedSelectedPlayer = localStorage.getItem(
      `draft:player:${result.id}`,
    );
    if (storedSelectedPlayer) {
      draftActions.setSelectedPlayer(parseInt(storedSelectedPlayer));
    }
  }, []);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  if (draftFinished) {
    return (
      <SyncDraftContext.Provider value={{ syncDraft, syncing }}>
        <FinalizedDraft />
      </SyncDraftContext.Provider>
    );
  }

  if (selectedPlayer === undefined) {
    return (
      <PlayerSelectionScreen
        onDraftJoined={(playerId) => {
          localStorage.setItem(
            `draft:player:${result.id}`,
            playerId.toString(),
          );
          draftActions.setSelectedPlayer(playerId);
        }}
      />
    );
  }

  const isInBanPhase = () => {
    if (!settings.modifiers) return false;
    const banModifier = settings.modifiers.banFactions;
    if (!banModifier) return false;

    const totalBansNeeded = banModifier.numFactions * draft.players.length;
    const currentPickNumber = draft.selections.length;

    return currentPickNumber < totalBansNeeded;
  };

  if (isInBanPhase()) {
    return (
      <SyncDraftContext.Provider value={{ syncDraft, syncing }}>
        <BanPhase />
      </SyncDraftContext.Provider>
    );
  }

  return (
    <SyncDraftContext.Provider value={{ syncDraft, syncing }}>
      <PlanetFinder onSystemSelected={syncDraft} />
      <audio id="notificationSound" src="/chime.mp3" preload="auto"></audio>
      <Stack gap="sm" mb="60" mt="lg">
        <CurrentPickBanner />
        <div style={{ height: 15 }} />
      </Stack>

      <Grid gutter="xl">
        {/* Add this new Grid.Col at the top */}
        <Grid.Col span={12} order={{ base: 0 }}>
          <Text size="md" ta="right">
            Draft URL: https://tidraft.com/draft/{result.urlName}
          </Text>
        </Grid.Col>

        {settings.draftSpeaker && (
          <Grid.Col
            span={{ base: 12, sm: 6 }}
            order={{ base: 3, sm: 1, lg: 1 }}
          >
            <SpeakerOrderSection />
          </Grid.Col>
        )}
        <Grid.Col
          span={settings.draftSpeaker ? { base: 12, sm: 6 } : 12}
          order={{ base: 1, sm: 2, lg: 2 }}
        >
          <DraftOrderSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 4, sm: 4, lg: 3 }}>
          <Stack gap="lg">
            <DraftableFactionsSection />
            <DraftableMinorFactionsSection />
            <DraftablePlayerColorsSection />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, sm: 3, lg: 4 }}>
          <DraftSummarySection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 5, sm: 5, lg: 5 }}>
          <SlicesSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 6, sm: 6, lg: 6 }}>
          <MapSection />
        </Grid.Col>

        {adminMode && (
          <Grid.Col offset={6} span={6} order={{ base: 7 }}>
            <PlayerInputSection
              players={draft.players}
              onChangeName={(playerIdx, name) => {
                draftStore.actions.updatePlayerName(playerIdx, name);
              }}
            />
            <Button mt="lg" onClick={syncDraft} loading={syncing}>
              Save
            </Button>
          </Grid.Col>
        )}
      </Grid>
    </SyncDraftContext.Provider>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { id, draft } = (await request.json()) as {
    id: string;
    draft: Draft;
    turnPassed: boolean;
  };

  // if this draft data is the old legacy draft data,
  // force a page reload instead
  if ((draft as any)["mapString"] !== undefined) {
    throw new Error("Cannot read old draft!");
  }

  const existingDraft = await draftById(id);
  const existingDraftData = JSON.parse(existingDraft.data as string) as Draft;
  await updateDraft(id, draft);

  // only notify if a selection was made
  if (existingDraftData.selections.length != draft.selections.length) {
    await notifyPick(id, existingDraft.urlName!, draft);
  }

  return { success: true };
}

export const loader = async ({ params }: { params: { id: string } }) => {
  const draftId = params.id;

  // If using a legacy "UUID url", generate a pretty URL
  // and then redirect to it.
  if (validateUUID(draftId)) {
    console.log("UUID url detected, generating pretty url");
    const draft = await draftById(draftId);
    if (draft.urlName) {
      console.log(`redirecting to pretty url ${draft.urlName}`);
      return redirect(`/draft/${draft.urlName}`);
    }

    const prettyUrl = await generateUniquePrettyUrl();
    await db
      .update(drafts)
      .set({ urlName: prettyUrl })
      .where(eq(drafts.id, draftId))
      .run();

    console.log(`redirecting to pretty url ${prettyUrl}`);
    return redirect(`/draft/${prettyUrl}`);
  }

  const result = await draftByPrettyUrl(draftId);
  return json({
    ...result,
    data: JSON.parse(result.data as string) as Draft,
  });
};
