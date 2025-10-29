import { useFetcher } from "@remix-run/react";
import { createContext, useContext, useEffect } from "react";
import { draftStore } from "~/draftStore";
import { useSocket } from "~/socketContext";
import { notifications } from "@mantine/notifications";
import { FactionId, PlayerId } from "~/types";

export function useSyncDraft() {
  const { syncDraft, syncing, stagePriorityValue, stageHomeSystem } =
    useContext(SyncDraftContext);
  return { syncDraft, syncing, stagePriorityValue, stageHomeSystem };
}

export function useSyncDraftFetcher() {
  const fetcher = useFetcher({ key: "sync-draft" });
  const socket = useSocket();

  useEffect(() => {
    if ((fetcher.data as { success: boolean })?.success === false) {
      window.location.reload();
    }

    // Show Discord error notification if present
    const data = fetcher.data as {
      discordError?: boolean;
      discordMessage?: string;
    };
    if (data?.discordError && data?.discordMessage) {
      notifications.show({
        title: "Discord Notification Failed",
        message: data.discordMessage,
        color: "red",
        autoClose: 10000,
      });
    }
  }, [fetcher.data]);

  return {
    syncDraft: async () => {
      const { draft, draftId } = draftStore.getState();
      if (!draft || !draftId) return;

      fetcher.submit(
        { id: draftId, draft },
        { method: "POST", encType: "application/json" },
      );
      socket?.emit("syncDraft", draftId, JSON.stringify(draft));
    },
    stagePriorityValue: async (playerId: PlayerId, factionId: FactionId) => {
      const { draftId, draftActions } = draftStore.getState();
      if (!draftId) return;

      draftActions.stagePriorityValue(playerId, factionId);

      const response = await fetch(`/api/draft/${draftId}/stage-priority`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, factionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to stage priority value:", error);
        notifications.show({
          title: "Error",
          message: error.error || "Failed to stage priority value",
          color: "red",
        });
        return;
      }

      const data = await response.json();
      if (data.success && data.draft) {
        draftActions.update(draftId, data.draft);
      }
    },
    stageHomeSystem: async (playerId: PlayerId, factionId: FactionId) => {
      const { draftId, draftActions } = draftStore.getState();
      if (!draftId) return;

      draftActions.stageHomeSystem(playerId, factionId);

      const response = await fetch(`/api/draft/${draftId}/stage-home`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, factionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to stage home system:", error);
        notifications.show({
          title: "Error",
          message: error.error || "Failed to stage home system",
          color: "red",
        });
        return;
      }

      const data = await response.json();
      if (data.success && data.draft) {
        draftActions.update(draftId, data.draft);
      }
    },
    syncing: fetcher.state === "submitting",
  };
}

export const SyncDraftContext = createContext({
  syncDraft: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stagePriorityValue: async (_: PlayerId, __: FactionId) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stageHomeSystem: async (_: PlayerId, __: FactionId) => {},
  syncing: false,
});
