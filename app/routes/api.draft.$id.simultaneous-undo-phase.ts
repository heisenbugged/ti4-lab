import { ActionFunctionArgs, data } from "react-router";
import { clearStagedSelections, updateDraft } from "~/drizzle/draft.server";
import { Draft, SimultaneousPickType } from "~/types";
import {
  applyTexasUndo,
  broadcastDraftWithStaged,
  draftNotFound,
  loadDraft,
  undoOutOfSync,
} from "~/utils/draftApi.server";

type UndoPhaseBody = {
  phase: SimultaneousPickType;
  expectedSelectionCount?: number;
};

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

  const draft = await loadDraft(id);
  if (!draft) return draftNotFound();

  const outOfSync = undoOutOfSync(draft, body.expectedSelectionCount);
  if (outOfSync) return outOfSync;

  await clearStagedSelections(id, body.phase);

  let removedSelection: Draft["selections"][number] | undefined;
  if (draft.selections.length > 0) {
    removedSelection = draft.selections.pop();
  }

  applyTexasUndo(draft, removedSelection);

  if (removedSelection) {
    await updateDraft(id, draft);
  }

  const payload = await broadcastDraftWithStaged(id, draft);

  return data({
    success: true,
    removedSelection,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
