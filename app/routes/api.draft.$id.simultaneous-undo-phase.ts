import { ActionFunctionArgs, data } from "react-router";
import { clearStagedSelections } from "~/drizzle/draft.server";
import { SimultaneousPickType } from "~/types";
import {
  draftNotFound,
  loadDraft,
  undoLastSelection,
  undoOutOfSync,
} from "~/utils/draftApi.server";

type UndoPhaseBody = {
  phase: SimultaneousPickType;
  expectedSelectionCount?: number;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id!;
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
  return undoLastSelection(id, draft);
}
