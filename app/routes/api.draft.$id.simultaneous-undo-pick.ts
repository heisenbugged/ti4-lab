import { ActionFunctionArgs, data } from "react-router";
import {
  deleteStagedSelection,
  draftById,
  getDraftStagedSelections,
} from "~/drizzle/draft.server";
import { Draft, PlayerId, SimultaneousPickType } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";

type UndoPickBody = {
  phase: SimultaneousPickType;
  playerId: PlayerId;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as UndoPickBody;

  if (!body?.phase || body.playerId === undefined) {
    return data(
      { success: false, error: "Phase and player ID are required" },
      { status: 400 },
    );
  }

  const existingDraft = await draftById(id);
  if (!existingDraft) {
    return data({ success: false, error: "Draft not found" }, { status: 404 });
  }

  await deleteStagedSelection(id, body.phase, body.playerId);

  const latestDraft = await draftById(id);
  const latestDraftData = JSON.parse(latestDraft.data as string) as Draft;
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...latestDraftData, stagedSelections };

  await broadcastDraftUpdate(id, payload);

  return data({
    success: true,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
