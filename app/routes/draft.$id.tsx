import { SimpleGrid } from "@mantine/core";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { MapSection, SlicesSection } from "~/components/draft";
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
  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <SlicesSection
          mode="draft"
          slices={draft.slices}
          players={draft.players}
          onSelectSlice={(sliceIdx) => {
            draft.selectSlice(1, sliceIdx);
            syncDraft(result.id, draft.getPersisted());
          }}
        />
        <MapSection
          map={draft.hydratedMap}
          mode="draft"
          onSelectHomeTile={(tile) => {
            draft.selectSeat(1, tile.seatIdx);
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
    fetcher.submit(draft, { method: "POST", encType: "application/json" });
}

export async function action({ request }: ActionFunctionArgs) {
  const { id, data } = (await request.json()) as {
    id: number;
    data: PersistedDraft;
  };

  // TODO: Handle if not successful
  const result = db
    .update(drafts)
    .set({ data: JSON.stringify(data) })
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
