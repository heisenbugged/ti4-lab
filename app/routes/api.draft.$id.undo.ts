import { ActionFunctionArgs, data } from "react-router";
import {
  draftById,
  getDraftStagedSelections,
  updateDraft,
} from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";
import { rebuildTexasDraftState } from "~/draft/texas/texasDraft";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { expectedSelectionCount?: number };

  const existingDraft = await draftById(id);
  if (!existingDraft) {
    return data({ success: false, error: "Draft not found" }, { status: 404 });
  }

  const draft = JSON.parse(existingDraft.data as string) as Draft;

  if (
    body.expectedSelectionCount !== undefined &&
    body.expectedSelectionCount !== draft.selections.length
  ) {
    return data(
      {
        success: false,
        error: "out_of_sync",
        message:
          "Draft state has changed. Please refresh to see the current state before undoing.",
        serverSelectionCount: draft.selections.length,
        expectedSelectionCount: body.expectedSelectionCount,
      },
      { status: 409 },
    );
  }

  if (draft.selections.length === 0) {
    return data(
      { success: false, error: "No selections to undo" },
      { status: 400 },
    );
  }

  const removedSelection = draft.selections.pop();

  if (draft.settings.draftGameMode === "texasStyle" && removedSelection) {
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

    if (removedSelection.type === "COMMIT_SIMULTANEOUS") {
      if (
        removedSelection.phase === "texasBlueKeep1" ||
        removedSelection.phase === "texasBlueKeep2" ||
        removedSelection.phase === "texasRedKeep" ||
        removedSelection.phase === "texasFaction"
      ) {
        rebuildTexasDraftState(draft);
      }
    }
  }

  await updateDraft(id, draft);
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...draft, stagedSelections };
  await broadcastDraftUpdate(id, payload);

  return data({
    success: true,
    removedSelection,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
