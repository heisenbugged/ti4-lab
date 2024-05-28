import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { useSocket } from "~/socketContext";
import { PersistedDraft } from "~/types";
import { FinalizedDraft } from "./components/FinalizedDraft";
import { DraftableFactionsSection } from "./components/DraftableFactionsSection";
import { SlicesSection } from "../draft/SlicesSection";
import { MapSection } from "../draft/MapSection";
import { Section, SectionTitle } from "~/components/Section";
import { playerSpeakerOrder } from "~/utils/map";
import { PlayerChip } from "./components/PlayerChip";
import { CurrentPickBanner } from "./components/CurrentPickBanner";
import { DraftOrder } from "./components/DraftOrder";
import { PlayerSelectionScreen } from "./components/PlayerSelectionScreen";
import {
  playNotificationSound,
  requestNotificationPermission,
  showNotification,
} from "~/utils/notifications";
import { LoadingOverlay } from "~/components/LoadingOverlay";

export default function RunningDraft() {
  const { adminMode } = useOutletContext<{ adminMode: boolean }>();

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
    socket.on("syncDraft", (data) => {
      const draft = JSON.parse(data) as PersistedDraft;
      useDraft.getState().hydrate(draft);
    });
    socket.emit("joinDraft", result.id);
  }, [socket]);

  const result = useLoaderData<typeof loader>();
  const draft = useDraft();
  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>();

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draft.hydrate(result.data);
    const storedSelectedPlayer = localStorage.getItem(
      `draft:player:${result.id}`,
    );
    if (storedSelectedPlayer) {
      setSelectedPlayer(parseInt(storedSelectedPlayer));
    }
  }, []);

  const syncDraft = useSyncDraft();

  const handleSync = async () => {
    const persistedDraft = draft.getPersisted();
    await syncDraft(result.id, persistedDraft);
    socket?.emit("syncDraft", result.id, JSON.stringify(persistedDraft));
  };

  const draftFinalized = draft.currentPick >= draft.pickOrder.length;
  const activePlayerId = draft.pickOrder[draft.currentPick];
  const activePlayer = draft.players.find((p) => p.id === activePlayerId);

  const currentlyPicking = activePlayerId === selectedPlayer || adminMode;
  const canSelectSlice = currentlyPicking && (activePlayer?.sliceIdx ?? -1) < 0;
  const canSelectSeat = currentlyPicking && (activePlayer?.seatIdx ?? -1) < 0;
  const canSelectFaction = currentlyPicking && !activePlayer?.faction;
  const canSelectSpeakerOrder = currentlyPicking && !activePlayer?.speakerOrder;

  useEffect(() => {
    if (activePlayerId === undefined || selectedPlayer === undefined) return;
    if (activePlayerId === selectedPlayer) {
      handleNotify();
    }
  }, [activePlayerId === selectedPlayer]);

  if (!draft.initialized || !draft.hydratedMap) return <LoadingOverlay />;

  if (draftFinalized) {
    return <FinalizedDraft />;
  }

  if (selectedPlayer === undefined) {
    return (
      <PlayerSelectionScreen
        players={draft.players}
        onDraftJoined={(player) => {
          localStorage.setItem(
            `draft:player:${result.id}`,
            player.id.toString(),
          );
          setSelectedPlayer(player.id);
        }}
      />
    );
  }

  return (
    <>
      <audio id="notificationSound" src="/chime.mp3" preload="auto"></audio>
      <Stack gap="sm" mb="60" mt="lg">
        <CurrentPickBanner
          player={activePlayer!!}
          lastEvent={draft.lastEvent}
        />
        <div style={{ height: 65 }} />
        <DraftOrder
          players={draft.players}
          pickOrder={draft.pickOrder}
          currentPick={draft.currentPick}
        />
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <Stack flex={1} gap="xl">
          <DraftableFactionsSection
            allowFactionSelection={canSelectFaction}
            factions={draft.factions}
            players={draft.players}
            onSelectFaction={(factionId) => {
              draft.selectFaction(activePlayerId, factionId);
              handleSync();
            }}
          />
          <SlicesSection
            config={draft.config}
            mode="draft"
            allowSliceSelection={canSelectSlice}
            slices={draft.slices}
            players={draft.players}
            onSelectSlice={(sliceIdx) => {
              draft.selectSlice(activePlayerId, sliceIdx);
              handleSync();
            }}
          />
        </Stack>
        <Stack flex={1} gap="xl">
          <Section>
            <SectionTitle title="Speaker Order" />
            <SimpleGrid cols={{ base: 3, sm: 6, md: 6, lg: 3, xl: 6 }}>
              {playerSpeakerOrder.map((so, idx) => {
                const player = draft.players.find(
                  (p) => p.speakerOrder === idx,
                );
                return (
                  <Stack
                    key={so}
                    bg="gray.1"
                    align="center"
                    p="sm"
                    style={{
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                    pos="relative"
                    gap={6}
                    justify="stretch"
                  >
                    <Text ff="heading" fw="bold">
                      {so}
                    </Text>
                    {!player && canSelectSpeakerOrder && (
                      <Button
                        size="compact-sm"
                        px="lg"
                        onMouseDown={() => {
                          draft.selectSpeakerOrder(activePlayerId, idx);
                          handleSync();
                        }}
                      >
                        Select
                      </Button>
                    )}
                    {player && <PlayerChip player={player} />}
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Section>
          <MapSection
            config={draft.config}
            map={draft.hydratedMap}
            allowSeatSelection={canSelectSeat}
            mode="draft"
            onSelectHomeTile={(tile) => {
              draft.selectSeat(activePlayerId, tile.seatIdx);
              handleSync();
            }}
          />
        </Stack>
      </SimpleGrid>
    </>
  );
}

function useSyncDraft() {
  const fetcher = useFetcher();
  return async (id: number, draft: PersistedDraft) =>
    fetcher.submit(
      { id, draft },
      { method: "POST", encType: "application/json" },
    );
}

export async function action({ request }: ActionFunctionArgs) {
  const { id, draft } = (await request.json()) as {
    id: number;
    draft: PersistedDraft;
  };

  // TODO: Handle if not successful
  const result = db
    .update(drafts)
    .set({ data: JSON.stringify(draft) })
    .where(eq(drafts.id, id))
    .run();

  return { success: true };
}

export const loader = async ({ params }: { params: { id: number } }) => {
  const draftId = params.id;
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, draftId))
    .limit(1);

  const result = results[0];
  return json({
    ...result,
    data: JSON.parse(result.data as string) as PersistedDraft,
  });
};
