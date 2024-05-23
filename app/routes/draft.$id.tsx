import { SimpleGrid } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { MapSection, SlicesSection } from "~/components/draft";
import { serializeDraft } from "~/data/serialize";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { PersistedDraft } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
  const { id, data } = await request.json();
  const result = db
    .update(drafts)
    .set({ data: JSON.stringify(data) })
    .where(eq(drafts.id, id))
    .run();

  // TODO: Handle if not successful
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

export default function RunningDraft() {
  const result = useLoaderData<typeof loader>();
  const draft = useDraft();
  const fetcher = useFetcher();
  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draft.hydrate(result.data);
  }, []);

  const syncDraft = async () => {
    const { players, factions, mapString, slices } = useDraft.getState();
    fetcher.submit(
      {
        id: result.id,
        data: serializeDraft({
          players,
          factions,
          mapString,
          slices,
        }),
      },
      { method: "POST", encType: "application/json" },
    );
  };

  if (!draft.hydratedMap) return <></>;
  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <SlicesSection
          mode="draft"
          slices={draft.slices}
          players={draft.players}
          onSelectSlice={(sliceIdx) => {
            draft.selectSlice(1, sliceIdx);
            syncDraft();
          }}
        />
        <MapSection
          map={draft.hydratedMap}
          mode="draft"
          onSelectHomeTile={(tile) => {
            draft.selectSeat(1, tile.seatIdx);
            syncDraft();
          }}
        />
      </SimpleGrid>
    </>
  );
}
