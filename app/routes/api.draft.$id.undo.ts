import { ActionFunctionArgs, data } from "react-router";
import { updateDraft } from "~/drizzle/draft.server";
import {
  applyTexasUndo,
  broadcastDraftWithStaged,
  draftNotFound,
  loadDraft,
  undoOutOfSync,
} from "~/utils/draftApi.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { expectedSelectionCount?: number };

  const draft = await loadDraft(id);
  if (!draft) return draftNotFound();

  const outOfSync = undoOutOfSync(draft, body.expectedSelectionCount);
  if (outOfSync) return outOfSync;

  if (draft.selections.length === 0) {
    return data(
      { success: false, error: "No selections to undo" },
      { status: 400 },
    );
  }

  const removedSelection = draft.selections.pop();
  applyTexasUndo(draft, removedSelection);

  await updateDraft(id, draft);
  const payload = await broadcastDraftWithStaged(id, draft);

  return data({
    success: true,
    removedSelection,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
