import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { getDraftForReplay } from "~/server/drafts.functions";
import { ReplayControls } from "./-components/ReplayControls";
import { DraftBoard } from "../-components/DraftBoard";
import { useDraftUiSettings } from "~/draftUiSettings";

export const Route = createFileRoute("/draft/$id/replay")({
  loader: ({ params }) => getDraftForReplay({ data: params.id }),
  // Seeds the draft store once per visit; never re-enter from a cached copy.
  gcTime: 0,
  component: DraftReplay,
});

function DraftReplay() {
  const result = Route.useLoaderData();
  const { setAdminMode, setPickForAnyone } = useDraftUiSettings();
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
  }, [result.id]);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  return (
    <>
      <ReplayControls />
      <DraftBoard stickyTop="calc(var(--header-h) + var(--sat) + 104px)" />
    </>
  );
}
