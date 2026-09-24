import { Stack } from "@mantine/core";
import { data } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { Draft } from "~/types";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { redirectToPrettyDraftUrl } from "~/utils/draftRedirect.server";
import { ReplayControls } from "./components/ReplayControls";
import { DraftBoard } from "../draft.$id/components/DraftBoard";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export default function DraftReplay() {
  const result = useLoaderData<typeof loader>();
  const { setAdminMode, setPickForAnyone } = useSafeOutletContext();
  const draftStore = useDraft();

  // Disable admin and pick-for-anyone modes in replay
  useEffect(() => {
    setAdminMode(false);
    setPickForAnyone(false);
  }, []);

  // pre-seed store with loaded persisted draft and enable replay mode
  useEffect(() => {
    draftStore.draftActions.hydrate(result.id!, result.urlName!, result.data);
    draftStore.replayActions.enableReplayMode();
  }, []);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  return (
    <Stack gap="sm" mb="60" mt="lg">
      <ReplayControls />

      <DraftBoard urlName={result.urlName} />
    </Stack>
  );
}

export const loader = async ({ params }: { params: { id: string } }) => {
  const draftId = params.id;

  // If using a legacy "UUID url", generate a pretty URL
  // and then redirect to it.
  if (validateUUID(draftId)) {
    return redirectToPrettyDraftUrl(draftId, "/replay");
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  return data({
    ...result,
    data: JSON.parse(result.data as string) as Draft,
  });
};
