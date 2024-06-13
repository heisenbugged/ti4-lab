import { useFetcher } from "@remix-run/react";
import { createContext, useContext } from "react";
import { draftStore } from "~/draftStore";
import { useSocket } from "~/socketContext";

export function useSyncDraft() {
  const { syncDraft, syncing } = useContext(SyncDraftContext);
  return { syncDraft, syncing };
}

export function useSyncDraftFetcher() {
  const fetcher = useFetcher({ key: "sync-draft" });
  const socket = useSocket();

  return {
    syncDraft: async () => {
      const { draft, draftId } = draftStore.getState();
      if (!draft || !draftId) return;
      console.log("are we here?");

      await fetcher.submit(
        { id: draftId, draft },
        { method: "POST", encType: "application/json" },
      );

      socket?.emit("syncDraft", draftId, JSON.stringify(draft));
    },
    syncing: fetcher.state === "submitting",
  };
}

export const SyncDraftContext = createContext({
  syncDraft: () => {},
  syncing: false,
});
