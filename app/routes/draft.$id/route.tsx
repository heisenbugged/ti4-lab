import { Box, Group, SimpleGrid, Stack, Table, Title } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { DraftableFaction } from "~/components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { MapSection, SlicesSection } from "~/components/draft";
import { DraftableFactionsSection } from "~/components/draft/DraftableFactionsSection";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { useSocket } from "~/socketContext";
import { PersistedDraft } from "~/types";
import { Section, SectionTitle } from "~/components/draft/Section";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { FinalizedDraft } from "./FinalizedDraft";

export default function RunningDraft() {
  // Example of socket, to be put on actual draft page.
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

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draft.hydrate(result.data);
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
  const hasSelectedSlice = (activePlayer?.sliceIdx ?? -1) >= 0;
  const hasSelectedSeat = (activePlayer?.seatIdx ?? -1) >= 0;
  const hasSelectedFaction = !!activePlayer?.faction;

  if (!draft.hydratedMap) return <></>;

  if (draftFinalized) {
    return <FinalizedDraft />;
  }

  return (
    <>
      <Stack gap="sm" mb="60" mt="lg">
        <Title order={3}>Draft Order</Title>
        <Group gap={1}>
          {draft.pickOrder.map((playerId, idx) => {
            const player = draft.players.find(({ id }) => id === playerId)!!;
            const active = idx === draft.currentPick;
            return (
              <Group
                key={idx}
                bg={active ? "purple.7" : "gray.2"}
                px="md"
                py="xs"
                gap="sm"
              >
                <img
                  src={`/avatar/avatar${player.id - 1}.png`}
                  style={{ width: 20 }}
                />
                <Title order={5} c={active ? "white" : "gray.8"} lh={1}>
                  {player.name}
                </Title>
              </Group>
            );
          })}
        </Group>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <Stack flex={1} gap="xl">
          <DraftableFactionsSection
            allowFactionSelection={!hasSelectedFaction}
            factions={draft.factions}
            players={draft.players}
            onSelectFaction={(factionId) => {
              draft.selectFaction(activePlayerId, factionId);
              handleSync();
            }}
          />
          <SlicesSection
            mode="draft"
            allowSliceSelection={!hasSelectedSlice}
            slices={draft.slices}
            players={draft.players}
            onSelectSlice={(sliceIdx) => {
              draft.selectSlice(activePlayerId, sliceIdx);
              handleSync();
            }}
          />
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection
            map={draft.hydratedMap}
            allowSeatSelection={!hasSelectedSeat}
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
