import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { rawDraftStore } from "~/rawDraftStore";
import { useSocket } from "~/socketContext";

export function useSyncRawDraftFetcher() {
  const fetcher = useFetcher({ key: "sync-raw-draft" });
  const socket = useSocket();

  useEffect(() => {
    if ((fetcher.data as { success: boolean })?.success === false) {
      window.location.reload();
    }
  }, [fetcher.data]);

  return {
    syncRawDraft: async () => {
      const { state, draftId } = rawDraftStore.getState();
      if (!state || !draftId) {
        console.warn(
          "[Client] Cannot sync raw draft - missing state or draftId:",
          {
            hasState: !!state,
            draftId,
          },
        );
        return;
      }

      console.log("[Client] Syncing raw draft:", {
        draftId,
        eventsCount: state.events.length,
        playersCount: state.players.length,
      });

      const stateJson = JSON.stringify(state);
      console.log("[Client] Submitting to action and emitting socket event");

      fetcher.submit(
        { id: draftId, rawDraft: state },
        { method: "POST", encType: "application/json" },
      );

      if (socket) {
        console.log("[Client] Emitting syncRawDraft socket event:", {
          draftId,
          dataLength: stateJson.length,
        });
        socket.emit("syncRawDraft", draftId, stateJson);
      } else {
        console.warn("[Client] Socket not available, cannot broadcast update");
      }
    },
    syncing: fetcher.state === "submitting",
  };
}
