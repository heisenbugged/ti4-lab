import { Box, Group, SimpleGrid, Stack, Title } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import {
  AvailableFactionsSection,
  MapSection,
  SlicesSection,
} from "~/components/draft";
import { DraftableFactionsSection } from "~/components/draft/DraftableFactionsSection";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { PersistedDraft } from "~/types";

export default function RunningDraft() {
  const result = useLoaderData<typeof loader>();
  const draft = useDraft();

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draft.hydrate(result.data);
  }, []);

  const syncDraft = useSyncDraft();

  if (!draft.hydratedMap) return <></>;

  const activePlayerId = draft.pickOrder[draft.currentPick];
  const activePlayer = draft.players.find((p) => p.id === activePlayerId);
  const hasSelectedSlice = (activePlayer?.sliceIdx ?? -1) >= 0;
  const hasSelectedSeat = (activePlayer?.seatIdx ?? -1) >= 0;
  const hasSelectedFaction = !!activePlayer?.faction;

  return (
    <>
      <Stack gap="sm" mb="60">
        <Title order={2}>Draft Order</Title>
        <Group gap={1}>
          {draft.pickOrder.map((playerId, idx) => {
            const player = draft.players.find(({ id }) => id === playerId)!!;
            const active = idx === draft.currentPick;
            return (
              <Box
                key={player.id}
                bg={active ? "violet.7" : "gray.5"}
                px="md"
                py="xs"
              >
                <Title order={5} c={active ? "white" : "gray.8"} lh={1}>
                  {player.name}
                </Title>
              </Box>
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
              syncDraft(result.id, draft.getPersisted());
            }}
          />
          <SlicesSection
            mode="draft"
            allowSliceSelection={!hasSelectedSlice}
            slices={draft.slices}
            players={draft.players}
            onSelectSlice={(sliceIdx) => {
              draft.selectSlice(activePlayerId, sliceIdx);
              syncDraft(result.id, draft.getPersisted());
            }}
          />
        </Stack>
        <MapSection
          map={draft.hydratedMap}
          allowSeatSelection={!hasSelectedSeat}
          mode="draft"
          onSelectHomeTile={(tile) => {
            draft.selectSeat(activePlayerId, tile.seatIdx);
            syncDraft(result.id, draft.getPersisted());
          }}
        />
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
