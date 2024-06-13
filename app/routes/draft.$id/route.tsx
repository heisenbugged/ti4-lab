import { Button, Grid, SimpleGrid, Stack, Tabs, Text } from "@mantine/core";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect, useRef, useState } from "react";
import { useDraft, useDraftV2 } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { useSocket } from "~/socketContext";
import { Draft, PersistedDraft } from "~/types";
import { FinalizedDraft } from "./components/FinalizedDraft";
import { DraftableFactionsSection } from "./components/DraftableFactionsSection";

import { MapSection } from "../draft/MapSection";
import { Section, SectionTitle } from "~/components/Section";
import { playerSpeakerOrder } from "~/utils/map";
import { CurrentPickBanner } from "./components/CurrentPickBanner";
import { DraftOrder } from "./components/DraftOrder";
import { PlayerSelectionScreen } from "./components/PlayerSelectionScreen";
import {
  playNotificationSound,
  requestNotificationPermission,
  showNotification,
} from "~/utils/notifications";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { MidDraftSummary } from "./components/MidDraftSummary";
import { SlicesTable } from "../draft/SlicesTable";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
} from "~/drizzle/draft.server";
import { DraftableSpeakerOrder } from "./components/DraftableSpeakerOrder";
import { allFactionIds } from "~/data/factionData";
import { allDraftableSystemIds } from "~/data/systemData";
import { useDisclosure } from "@mantine/hooks";
import { PlanetFinder } from "./components/PlanetFinder";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { notifyCurrentPick } from "~/discord/bot.server";
import { useHydratedMap } from "~/hooks/useHydratedMap";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { SlicesSection, SpeakerOrderSection } from "./sections";

export default function RunningDraft() {
  const { adminMode, pickForAnyone } = useOutletContext<{
    adminMode: boolean;
    pickForAnyone: boolean;
  }>();

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
      useDraft.getState().hydrate(draft, result.urlName!);
    });
  }, [socket]);

  const result = useLoaderData<typeof loader>();
  // const draft = useDraft();
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

  const { syncDraft, syncing } = useSyncDraft();

  const draftFinalized = currentPick >= draft.pickOrder.length;
  const activePlayerId = draft.pickOrder[currentPick];
  const activePlayer = draft.players.find((p) => p.id === activePlayerId);

  const currentlyPicking = activePlayerId === selectedPlayer || pickForAnyone;
  const canSelectSlice = currentlyPicking && (activePlayer?.sliceIdx ?? -1) < 0;
  const canSelectSeat = currentlyPicking && (activePlayer?.seatIdx ?? -1) < 0;
  const canSelectFaction = currentlyPicking && !activePlayer?.faction;

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

  // TODO: Restore planet finder,.
  const planetFinder = <></>;
  // const planetFinder = (
  //   <PlanetFinder
  //     factionPool={allFactionIds}
  //     availableSystemIds={allDraftableSystemIds}
  //     allowHomePlanetSearch
  //     opened={planetFinderOpened}
  //     onClose={() => {
  //       closePlanetFinder();
  //     }}
  //     onSelectSystem={(system) => {
  //       if (!selectedTile.current) return;
  //       draft.addSystemToMap(selectedTile.current, system);
  //       closePlanetFinder();
  //       handleSync();
  //     }}
  //     usedSystemIds={[]}
  //   />
  // );
  if (!draftV2.hydrated) return <LoadingOverlay />;

  // debugger;

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
      {planetFinder}
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
          <Stack>
            <SectionTitle title="Draft Order" />
            {/* <DraftOrder
              players={draft.players}
              pickOrder={draft.pickOrder}
              currentPick={draft.currentPick}
            /> */}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          {/* <DraftableFactionsSection
            allowFactionSelection={canSelectFaction}
            factions={draft.factions}
            players={draft.players}
            onSelectFaction={(factionId) => {
              draft.selectFaction(activePlayerId, factionId);
              handleSync();
            }}
            disabled={syncing}
          /> */}
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Tabs defaultValue="draft" variant="pills">
            <SectionTitle title="Summary">
              <Tabs.List>
                <Tabs.Tab value="draft">Draft</Tabs.Tab>
                <Tabs.Tab value="slice">Slice </Tabs.Tab>
              </Tabs.List>
            </SectionTitle>
            <Tabs.Panel value="draft">
              <MidDraftSummary />
            </Tabs.Panel>
            <Tabs.Panel value="slice">
              {/* <SlicesTable
                slices={draftV2.draft.slices}
                draftedSlices={draftedSlices}
              /> */}
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <SlicesSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          {/* <MapSection
            config={draft.config}
            map={draft.hydratedMap}
            allowSeatSelection={canSelectSeat}
            mode={adminMode ? "create" : "draft"}
            onSelectHomeTile={(tile) => {
              draft.selectSeat(activePlayerId, tile.seatIdx);
              handleSync();
            }}
            onDeleteSystemTile={(tile) => draft.removeSystemFromMap(tile)}
            onSelectSystemTile={(tile) => {
              selectedTile.current = tile;
              openPlanetFinder();
            }}
            disabled={syncing}
          /> */}
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
