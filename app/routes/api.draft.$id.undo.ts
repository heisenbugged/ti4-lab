import { ActionFunctionArgs, data } from "react-router";
import {
  draftNotFound,
  loadDraft,
  undoLastSelection,
  undoOutOfSync,
} from "~/utils/draftApi.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id!;
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

  return undoLastSelection(id, draft);
}
