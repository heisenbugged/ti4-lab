import {
  draftById,
  getDraftStagedSelections,
  updateDraft,
} from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";
import {
  isTexasTilePhase,
  rebuildTexasDraftState,
} from "~/draft/texas/texasDraft";

export async function loadDraftRecord(id: string) {
  const record = await draftById(id);
  if (!record) return undefined;
  return { ...record, draft: JSON.parse(record.data as string) as Draft };
}

export async function loadDraft(id: string): Promise<Draft | undefined> {
  return (await loadDraftRecord(id))?.draft;
}

export function draftNotFound() {
  return { success: false as const, error: "Draft not found" as const };
}

export function undoOutOfSync(
  draft: Draft,
  expectedSelectionCount: number | undefined,
) {
  if (
    expectedSelectionCount === undefined ||
    expectedSelectionCount === draft.selections.length
  ) {
    return undefined;
  }

  return {
    success: false as const,
    error: "out_of_sync" as const,
    message:
      "Draft state has changed. Please refresh to see the current state before undoing.",
    serverSelectionCount: draft.selections.length,
    expectedSelectionCount,
  };
}

export async function broadcastDraftWithStaged(id: string, draft: Draft) {
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...draft, stagedSelections };
  await broadcastDraftUpdate(id, payload);
  return payload;
}

function applyTexasUndo(
  draft: Draft,
  removedSelection?: Draft["selections"][number],
) {
  if (draft.settings.draftGameMode !== "texasStyle" || !removedSelection) {
    return;
  }

  if (removedSelection.type === "PLACE_TILE" && draft.texasDraft?.playerTiles) {
    const mapTile = draft.presetMap[removedSelection.mapIdx];
    if (mapTile) {
      draft.presetMap[removedSelection.mapIdx] = {
        idx: mapTile.idx,
        position: mapTile.position,
        type: "OPEN",
      };
    }
    draft.texasDraft.playerTiles[removedSelection.playerId] = [
      ...(draft.texasDraft.playerTiles[removedSelection.playerId] ?? []),
      removedSelection.systemId,
    ];
  }

  if (
    removedSelection.type === "COMMIT_SIMULTANEOUS" &&
    (isTexasTilePhase(removedSelection.phase) ||
      removedSelection.phase === "texasFaction")
  ) {
    rebuildTexasDraftState(draft);
  }
}

/** Pops the last selection (if any), persists, and broadcasts the result. */
export async function undoLastSelection(id: string, draft: Draft) {
  const removedSelection = draft.selections.pop();
  applyTexasUndo(draft, removedSelection);
  if (removedSelection) {
    await updateDraft(id, draft);
  }

  const payload = await broadcastDraftWithStaged(id, draft);
  return {
    success: true as const,
    draft: payload,
    newSelectionCount: payload.selections.length,
  };
}
