import { useMutation } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { draftStore } from "~/draftStore";
import { useSocket } from "~/socketContext";
import { notify } from "~/ui/notify";
import {
  stageSimultaneousPick,
  syncDraft,
  undoLastPick,
  undoSimultaneousPhase,
  undoStagedPick,
} from "~/server/drafts.functions";
import { Draft, PlayerId, SimultaneousPickType } from "~/types";

type SyncDraftContextValue = ReturnType<typeof useDraftSyncMutations>;

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

type MutationResult =
  | { success: true; draft?: Draft }
  | { success: false; error: string; message?: string };

/**
 * Runs a draft mutation, applies the returned draft to the store and reports
 * failures. Resolves to whether the server accepted the mutation.
 */
async function runDraftMutation(
  mutation: () => Promise<MutationResult>,
  errorMessage: string,
  success?: { title: string; message: string },
): Promise<boolean> {
  let result: MutationResult;
  try {
    result = await mutation();
  } catch (error) {
    result = {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }

  if (!result.success) {
    console.error(`${errorMessage}:`, result);
    if (result.error === "out_of_sync") {
      reloadOutOfSync({
        title: "Cannot Undo - Out of Sync",
        message: result.message ?? "",
      });
    } else {
      notify({
        title: "Error",
        message: result.error || errorMessage,
        tone: "danger",
      });
    }
    return false;
  }

  const { draftId } = draftStore.getState();
  if (result.draft && draftId) {
    draftStore.getState().draftActions.update(draftId, result.draft);
    if (success) {
      notify({ ...success, tone: "success", timeout: 3000 });
    }
  }
  return true;
}

export function useDraftSyncMutations() {
  const socket = useSocket();

  const sync = useMutation({
    mutationKey: ["sync-draft"],
    mutationFn: (input: { id: string; draft: Draft }) =>
      syncDraft({ data: input }),
    onSuccess: (data) => {
      if (data.success === false) {
        if (data.error === "out_of_sync") {
          reloadOutOfSync({
            title: "Draft Out of Sync",
            message: `${data.message} (Server: ${data.serverSelectionCount} picks, Your client: ${data.clientSelectionCount} picks).`,
          });
        } else {
          window.location.reload();
        }
        return;
      }

      if (data.discordError && data.discordMessage) {
        notify({
          title: "Discord Notification Failed",
          message: data.discordMessage,
          tone: "danger",
          timeout: 10000,
        });
      }
    },
    onError: () => window.location.reload(),
  });

  /**
   * Optimistically sets (or clears) a player's staged pick, restoring the
   * previous value if the server rejects the mutation.
   */
  const mutateStagedPick = async (
    phase: SimultaneousPickType,
    playerId: PlayerId,
    value: string | undefined,
    ...mutation: Parameters<typeof runDraftMutation>
  ) => {
    const { draft, draftActions } = draftStore.getState();
    const setStaged = (staged: string | undefined) =>
      staged === undefined
        ? draftActions.clearStagedSelection(phase, playerId)
        : draftActions.stageSimultaneousPick(phase, playerId, staged);

    const previous = draft.stagedSelections?.[phase]?.[playerId];
    setStaged(value);
    if (!(await runDraftMutation(...mutation))) setStaged(previous);
  };

  return {
    syncDraft: async () => {
      const { draft, draftId } = draftStore.getState();
      if (!draft || !draftId) return;

      sync.mutate({ id: draftId, draft });
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
        () =>
          stageSimultaneousPick({
            data: { id: draftId, phase, playerId, value },
          }),
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
        () => undoStagedPick({ data: { id: draftId, phase, playerId } }),
        "Failed to undo staged pick",
        { title: "Pick Undone", message: "The staged pick has been removed." },
      );
    },
    undoSimultaneousPhase: async (phase: SimultaneousPickType) => {
      const { draftId, draft } = draftStore.getState();
      if (!draftId || !draft) return;

      await runDraftMutation(
        () =>
          undoSimultaneousPhase({
            data: {
              id: draftId,
              phase,
              expectedSelectionCount: draft.selections.length,
            },
          }),
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

      await runDraftMutation(
        () =>
          undoLastPick({
            data: {
              id: draftId,
              expectedSelectionCount: draft.selections.length,
            },
          }),
        "Failed to undo last pick",
        {
          title: "Pick Undone",
          message: "The last selection has been removed.",
        },
      );
    },
    syncing: sync.isPending,
  };
}
