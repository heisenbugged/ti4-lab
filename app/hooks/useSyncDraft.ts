import { useFetcher } from "react-router";
import { createContext, useContext, useEffect } from "react";
import { draftStore } from "~/draftStore";
import { useSocket } from "~/socketContext";
import { notifications } from "@mantine/notifications";
import { FactionId, PlayerId, SimultaneousPickType } from "~/types";

export function useSyncDraft() {
  const {
    syncDraft,
    syncing,
    stagePriorityValue,
    stageHomeSystem,
    stageSimultaneousPick,
    undoStagedPick,
    undoSimultaneousPhase,
    undoLastPick,
  } =
    useContext(SyncDraftContext);
  return {
    syncDraft,
    syncing,
    stagePriorityValue,
    stageHomeSystem,
    stageSimultaneousPick,
    undoStagedPick,
    undoSimultaneousPhase,
    undoLastPick,
  };
}

export function useSyncDraftFetcher() {
  const fetcher = useFetcher({ key: "sync-draft" });
  const socket = useSocket();

  useEffect(() => {
    const data = fetcher.data as {
      success: boolean;
      error?: string;
      message?: string;
      discordError?: boolean;
      discordMessage?: string;
      serverSelectionCount?: number;
      clientSelectionCount?: number;
    };

    if (data?.success === false) {
      // Handle out-of-sync error specifically
      if (data.error === "out_of_sync") {
        notifications.show({
          id: "out-of-sync-error",
          title: "Draft Out of Sync",
          message: `${data.message} (Server: ${data.serverSelectionCount} picks, Your client: ${data.clientSelectionCount} picks). Refreshing...`,
          color: "orange",
          autoClose: 3000,
        });
        // Delay refresh slightly so user sees the notification
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Other errors - just reload
        window.location.reload();
      }
    }

    // Show Discord error notification if present
    if (data?.discordError && data?.discordMessage) {
      notifications.show({
        title: "Discord Notification Failed",
        message: data.discordMessage,
        color: "red",
        autoClose: 10000,
      });
    }
  }, [fetcher.data]);

  const stageSimultaneousPick = async (
    phase: SimultaneousPickType,
    playerId: PlayerId,
    value: string,
  ) => {
    const { draftId, draftActions } = draftStore.getState();
    if (!draftId) return;

    draftActions.stageSimultaneousPick(phase, playerId, value);

    const response = await fetch(`/api/draft/${draftId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, value, phase }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to stage pick:", error);
      notifications.show({
        title: "Error",
        message: error.error || "Failed to stage selection",
        color: "red",
      });
      return;
    }

    const data = await response.json();
    if (data.success && data.draft) {
      draftActions.update(draftId, data.draft);
    }
  };

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
      await stageSimultaneousPick("priorityValue", playerId, factionId);
    },
    stageHomeSystem: async (playerId: PlayerId, factionId: FactionId) => {
      await stageSimultaneousPick("homeSystem", playerId, factionId);
    },
    stageSimultaneousPick,
    undoStagedPick: async (
      phase: SimultaneousPickType,
      playerId: PlayerId,
    ) => {
      const { draftId, draftActions } = draftStore.getState();
      if (!draftId) return { success: false };

      draftActions.clearStagedSelection(phase, playerId);

      const response = await fetch(
        `/api/draft/${draftId}/simultaneous-undo-pick`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, playerId }),
      },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to undo staged pick:", error);
        notifications.show({
          title: "Error",
          message: error.error || "Failed to undo staged pick",
          color: "red",
        });
        return { success: false };
      }

      const data = await response.json();
      if (data.success && data.draft) {
        draftActions.update(draftId, data.draft);
        notifications.show({
          title: "Pick Undone",
          message: "The staged pick has been removed.",
          color: "green",
          autoClose: 3000,
        });
      }
      return { success: true };
    },
    undoSimultaneousPhase: async (phase: SimultaneousPickType) => {
      const { draftId, draft, draftActions } = draftStore.getState();
      if (!draftId || !draft) return { success: false };

      const expectedSelectionCount = draft.selections.length;

      const response = await fetch(
        `/api/draft/${draftId}/simultaneous-undo-phase`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          expectedSelectionCount,
        }),
      },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to undo phase:", error);

        if (error.error === "out_of_sync") {
          notifications.show({
            title: "Cannot Undo - Out of Sync",
            message: `${error.message} Refreshing...`,
            color: "orange",
            autoClose: 3000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          notifications.show({
            title: "Error",
            message: error.error || "Failed to undo phase",
            color: "red",
          });
        }
        return { success: false };
      }

      const data = await response.json();
      if (data.success && data.draft) {
        draftActions.update(draftId, data.draft);
        notifications.show({
          title: "Phase Undone",
          message: "The simultaneous phase has been cleared.",
          color: "green",
          autoClose: 3000,
        });
      }
      return { success: true, removedSelection: data.removedSelection };
    },
    undoLastPick: async () => {
      const { draftId, draft, draftActions } = draftStore.getState();
      if (!draftId || !draft) return { success: false };

      const expectedSelectionCount = draft.selections.length;

      const response = await fetch(`/api/draft/${draftId}/undo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedSelectionCount }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to undo:", error);

        if (error.error === "out_of_sync") {
          notifications.show({
            title: "Cannot Undo - Out of Sync",
            message: `${error.message} Refreshing...`,
            color: "orange",
            autoClose: 3000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          notifications.show({
            title: "Error",
            message: error.error || "Failed to undo last pick",
            color: "red",
          });
        }
        return { success: false };
      }

      const data = await response.json();
      if (data.success && data.draft) {
        draftActions.update(draftId, data.draft);
        notifications.show({
          title: "Pick Undone",
          message: "The last selection has been removed.",
          color: "green",
          autoClose: 3000,
        });
      }
      return { success: true, removedSelection: data.removedSelection };
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stageSimultaneousPick: async (
    _: SimultaneousPickType,
    __: PlayerId,
    ___: string,
  ) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  undoStagedPick: async (_: SimultaneousPickType, __: PlayerId) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  undoSimultaneousPhase: async (_: SimultaneousPickType) => {},
  undoLastPick: async () => ({ success: false } as { success: boolean; removedSelection?: unknown }),
  syncing: false,
});
