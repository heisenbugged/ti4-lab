import { useFetcher } from "react-router";
import { createContext, useContext, useEffect } from "react";
import { draftStore } from "~/draftStore";
import { useSocket } from "~/socketContext";
import { notify } from "~/ui/notify";
import { Draft, PlayerId, SimultaneousPickType } from "~/types";

type SyncDraftContextValue = ReturnType<typeof useSyncDraftFetcher>;

const noop = async () => {};

export const SyncDraftContext = createContext<SyncDraftContextValue>({
  syncDraft: noop,
  stageSimultaneousPick: noop,
  undoStagedPick: noop,
  undoSimultaneousPhase: noop,
  undoLastPick: noop,
  syncing: false,
});

export const useSyncDraft = () => useContext(SyncDraftContext);

function reloadOutOfSync(notification: {
  title: string;
  message: string;
}) {
  notify({
    ...notification,
    message: `${notification.message} Refreshing...`,
    tone: "warning",
    timeout: 3000,
  });
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

async function postDraftMutation(
  draftId: string,
  action: string,
  body: unknown,
  errorMessage: string,
  success?: { title: string; message: string },
): Promise<boolean> {
  const response = await fetch(`/api/draft/${draftId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    console.error(`${errorMessage}:`, error);

    if (error.error === "out_of_sync") {
      reloadOutOfSync({
        title: "Cannot Undo - Out of Sync",
        message: error.message ?? "",
      });
    } else {
      notify({
        title: "Error",
        message: error.error || errorMessage,
        tone: "danger",
      });
    }
    return false;
  }

  const data = (await response.json()) as { success?: boolean; draft?: Draft };
  if (data.success && data.draft) {
    draftStore.getState().draftActions.update(draftId, data.draft);
    if (success) {
      notify({ ...success, tone: "success", timeout: 3000 });
    }
  }
  return true;
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
      if (data.error === "out_of_sync") {
        reloadOutOfSync({
          title: "Draft Out of Sync",
          message: `${data.message} (Server: ${data.serverSelectionCount} picks, Your client: ${data.clientSelectionCount} picks).`,
        });
      } else {
        window.location.reload();
      }
    }

    if (data?.discordError && data?.discordMessage) {
      notify({
        title: "Discord Notification Failed",
        message: data.discordMessage,
        tone: "danger",
        timeout: 10000,
      });
    }
  }, [fetcher.data]);

  /**
   * Optimistically sets (or clears) a player's staged pick, restoring the
   * previous value if the server rejects the mutation.
   */
  const mutateStagedPick = async (
    phase: SimultaneousPickType,
    playerId: PlayerId,
    value: string | undefined,
    ...mutation: Parameters<typeof postDraftMutation>
  ) => {
    const { draft, draftActions } = draftStore.getState();
    const setStaged = (staged: string | undefined) =>
      staged === undefined
        ? draftActions.clearStagedSelection(phase, playerId)
        : draftActions.stageSimultaneousPick(phase, playerId, staged);

    const previous = draft.stagedSelections?.[phase]?.[playerId];
    setStaged(value);
    if (!(await postDraftMutation(...mutation))) setStaged(previous);
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
    stageSimultaneousPick: async (
      phase: SimultaneousPickType,
      playerId: PlayerId,
      value: string,
    ) => {
      const { draftId } = draftStore.getState();
      if (!draftId) return;

      await mutateStagedPick(
        phase,
        playerId,
        value,
        draftId,
        "stage",
        { playerId, value, phase },
        "Failed to stage selection",
      );
    },
    undoStagedPick: async (phase: SimultaneousPickType, playerId: PlayerId) => {
      const { draftId } = draftStore.getState();
      if (!draftId) return;

      await mutateStagedPick(
        phase,
        playerId,
        undefined,
        draftId,
        "simultaneous-undo-pick",
        { phase, playerId },
        "Failed to undo staged pick",
        { title: "Pick Undone", message: "The staged pick has been removed." },
      );
    },
    undoSimultaneousPhase: async (phase: SimultaneousPickType) => {
      const { draftId, draft } = draftStore.getState();
      if (!draftId || !draft) return;

      await postDraftMutation(
        draftId,
        "simultaneous-undo-phase",
        { phase, expectedSelectionCount: draft.selections.length },
        "Failed to undo phase",
        {
          title: "Phase Undone",
          message: "The simultaneous phase has been cleared.",
        },
      );
    },
    undoLastPick: async () => {
      const { draftId, draft } = draftStore.getState();
      if (!draftId || !draft) return;
      if (!confirm("Are you sure you want to undo the last selection?")) return;

      await postDraftMutation(
        draftId,
        "undo",
        { expectedSelectionCount: draft.selections.length },
        "Failed to undo last pick",
        {
          title: "Pick Undone",
          message: "The last selection has been removed.",
        },
      );
    },
    syncing: fetcher.state === "submitting",
  };
}
