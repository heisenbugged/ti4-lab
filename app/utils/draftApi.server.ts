import { data } from "react-router";
import { draftById, getDraftStagedSelections } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";
import { rebuildTexasDraftState } from "~/draft/texas/texasDraft";

export async function loadDraft(id: string): Promise<Draft | undefined> {
  const existingDraft = await draftById(id);
  if (!existingDraft) return undefined;
  return JSON.parse(existingDraft.data as string) as Draft;
}

export function draftNotFound() {
  return data({ success: false, error: "Draft not found" }, { status: 404 });
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

  return data(
    {
      success: false,
      error: "out_of_sync",
      message:
        "Draft state has changed. Please refresh to see the current state before undoing.",
      serverSelectionCount: draft.selections.length,
      expectedSelectionCount,
    },
    { status: 409 },
  );
}

export async function broadcastDraftWithStaged(id: string, draft: Draft) {
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...draft, stagedSelections };
  await broadcastDraftUpdate(id, payload);
  return payload;
}

export function applyTexasUndo(
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
    (removedSelection.phase === "texasBlueKeep1" ||
      removedSelection.phase === "texasBlueKeep2" ||
      removedSelection.phase === "texasRedKeep" ||
      removedSelection.phase === "texasFaction")
  ) {
    rebuildTexasDraftState(draft);
  }
}
