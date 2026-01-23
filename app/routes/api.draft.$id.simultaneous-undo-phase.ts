import { ActionFunctionArgs, data } from "react-router";
import {
  clearStagedSelections,
  draftById,
  getDraftStagedSelections,
  updateDraft,
} from "~/drizzle/draft.server";
import { Draft, SimultaneousPickType } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";
import { rebuildTexasDraftState } from "~/draft/texas/texasDraft";

type UndoPhaseBody = {
  phase: SimultaneousPickType;
  expectedSelectionCount?: number;
};

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
    (removedSelection.phase === "texasBlueKeep1" ||
      removedSelection.phase === "texasBlueKeep2" ||
      removedSelection.phase === "texasRedKeep" ||
      removedSelection.phase === "texasFaction")
  ) {
    rebuildTexasDraftState(draft);
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as UndoPhaseBody;

  if (!body?.phase) {
    return data(
      { success: false, error: "Phase is required" },
      { status: 400 },
    );
  }

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

  await clearStagedSelections(id, body.phase);

  let removedSelection: Draft["selections"][number] | undefined;
  if (draft.selections.length > 0) {
    removedSelection = draft.selections.pop();
  }

  applyTexasUndo(draft, removedSelection);

  if (removedSelection) {
    await updateDraft(id, draft);
  }

  const latestDraft = await draftById(id);
  const latestDraftData = JSON.parse(latestDraft.data as string) as Draft;
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...latestDraftData, stagedSelections };

  await broadcastDraftUpdate(id, payload);

  return data({
    success: true,
    removedSelection,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
