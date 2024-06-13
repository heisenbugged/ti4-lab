import { Grid, Stack } from "@mantine/core";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect, useRef } from "react";
import { useDraftV2 } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { useSocket } from "~/socketContext";
import { Draft, PersistedDraft } from "~/types";
import { CurrentPickBanner } from "./components/CurrentPickBanner";
import { PlayerSelectionScreen } from "./components/PlayerSelectionScreen";
import {
  playNotificationSound,
  requestNotificationPermission,
  showNotification,
} from "~/utils/notifications";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
} from "~/drizzle/draft.server";
import { notifyCurrentPick } from "~/discord/bot.server";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { SlicesSection, SpeakerOrderSection } from "./sections";
import { DraftOrderSection } from "./sections/DraftOrderSection";
import { DraftableFactionsSection } from "./sections/DraftableFactionsSection";
import { MapSection } from "./sections/MapSection";
import { PlanetFinder } from "./components/PlanetFinder";
import { DraftSummarySection } from "./sections/DraftSummarySection";

export default function RunningDraft() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleNotify = () => {
    const title = "It's your turn to draft!";
    const options = {
      icon: "/icon.png",
      badge: "/badge.png",
    };
    showNotification(title, options);
    playNotificationSound();
  };

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
      const draft = JSON.parse(data) as PersistedDraft;
      // TODO: hydrate using the vanilla store
      // useDraft.getState().hydrate(draft, result.urlName!);
    });
  }, [socket]);

  const result = useLoaderData<typeof loader>();
  const draftV2 = useDraftV2();
  const draft = draftV2.draft;
  const settings = draft.settings;
  const draftActions = draftV2.draftActions;
  const selectedPlayer = draftV2.selectedPlayer;
  const { currentPick, hydratedMap, lastEvent } = useHydratedDraft();

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draftV2.draftActions.hydrate(result.id!, result.urlName!, result.data);

    const storedSelectedPlayer = localStorage.getItem(
      `draft:player:${result.id}`,
    );
    if (storedSelectedPlayer) {
      draftActions.setSelectedPlayer(parseInt(storedSelectedPlayer));
    }
  }, []);

  const draftFinalized = currentPick >= draft.pickOrder.length;
  const activePlayerId = draft.pickOrder[currentPick];
  const activePlayer = draft.players.find((p) => p.id === activePlayerId);
  const draftedSlices = draft.players
    .filter((p) => p.sliceIdx !== undefined)
    .map((p) => p.sliceIdx!);

  useEffect(() => {
    if (activePlayerId === undefined || selectedPlayer === undefined) return;
    if (activePlayerId === selectedPlayer) {
      handleNotify();
    }
  }, [activePlayerId === selectedPlayer]);

  const selectedTile = useRef<number>();

  if (!draftV2.hydrated) return <LoadingOverlay />;

  // if (draftFinalized) {
  //   return (
  //     <>
  //       {planetFinder}
  //       <FinalizedDraft
  //         adminMode={adminMode}
  //         onSavePlayerNames={handleSync}
  //         onSelectSystemTile={(systemId) => {
  //           selectedTile.current = systemId;
  //           // TODO: re-enable
  //           // openPlanetFinder();
  //         }}
  //       />
  //     </>
  //   );
  // }

  if (selectedPlayer === undefined) {
    return (
      <PlayerSelectionScreen
        onDraftJoined={(player) => {
          localStorage.setItem(
            `draft:player:${result.id}`,
            player.id.toString(),
          );
          draftActions.setSelectedPlayer(player.id);
        }}
      />
    );
  }

  return (
    <>
      <PlanetFinder />
      <audio id="notificationSound" src="/chime.mp3" preload="auto"></audio>
      <Stack gap="sm" mb="60" mt="lg">
        <CurrentPickBanner player={activePlayer!} lastEvent={lastEvent} />
        <div style={{ height: 15 }} />
      </Stack>

      <Grid gutter="xl">
        {/* {adminMode && (
          <Grid.Col offset={6} span={6}>
            <PlayerInputSection
              players={draft.players}
              onChangeName={(playerIdx, name) => {
                draft.updatePlayer(playerIdx, { name });
              }}
            />
            <Button mt="lg" onClick={handleSync} disabled={syncing}>
              Save
            </Button>
          </Grid.Col>
        )} */}

        {settings.draftSpeaker && (
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <SpeakerOrderSection />
          </Grid.Col>
        )}
        <Grid.Col span={settings.draftSpeaker ? { base: 12, sm: 6 } : 12}>
          <DraftOrderSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DraftableFactionsSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DraftSummarySection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <SlicesSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <MapSection />
        </Grid.Col>
      </Grid>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { id, draft, turnPassed } = (await request.json()) as {
    id: string;
    draft: PersistedDraft;
    turnPassed: boolean;
  };

  // TODO: Handle if not successful
  const result = db
    .update(drafts)
    .set({ data: JSON.stringify(draft) })
    .where(eq(drafts.id, id))
    .run();

  if (turnPassed) {
    await notifyCurrentPick(draft);
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

/**
 * Convert old drafts that stored slices as an array of strings instead array of numbers
 */
const translatePersistedDraft = (data: any): PersistedDraft => ({
  ...data,
  slices: data.slices.map((slice: any) => slice.map(Number)),
});
