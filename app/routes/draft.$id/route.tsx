import {
  Box,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
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
  const hasSelectedSpeakerOrder = !!activePlayer?.speakerOrder;

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
          <Section>
            <SectionTitle title="Speaker Order" />
            <SimpleGrid cols={{ base: 8, sm: 6, md: 6, lg: 6 }}>
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
                    {!player && !hasSelectedSpeakerOrder && (
                      <Button
                        size="xs"
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
