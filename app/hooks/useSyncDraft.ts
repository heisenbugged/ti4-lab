import { useFetcher } from "@remix-run/react";
import { draftV2Store, useDraftV2 } from "~/draftStore";
import { useSocket } from "~/socketContext";
import { Draft } from "~/types";

export function useSyncDraft() {
  const fetcher = useFetcher({ key: "sync-draft" });
  const socket = useSocket();

  return {
    syncDraft: async () => {
      const { draft, draftId } = draftV2Store.getState();
      if (!draft || !draftId) return;

      await fetcher.submit(
        { id: draftId, draft },
        { method: "POST", encType: "application/json" },
      );

      socket?.emit("syncDraft", draftId, JSON.stringify(draft));
    },
    state: fetcher.state,
    syncing: fetcher.state === "submitting",
  };
}
