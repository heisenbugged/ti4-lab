import { ActionFunctionArgs, data } from "react-router";
import { deleteStagedSelection } from "~/drizzle/draft.server";
import { PlayerId, SimultaneousPickType } from "~/types";
import {
  broadcastDraftWithStaged,
  draftNotFound,
  loadDraft,
} from "~/utils/draftApi.server";

type UndoPickBody = {
  phase: SimultaneousPickType;
  playerId: PlayerId;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id!;
  const body = (await request.json()) as UndoPickBody;

  if (!body?.phase || body.playerId === undefined) {
    return data(
      { success: false, error: "Phase and player ID are required" },
      { status: 400 },
    );
  }

  const draft = await loadDraft(id);
  if (!draft) return draftNotFound();

  await deleteStagedSelection(id, body.phase, body.playerId);
  const payload = await broadcastDraftWithStaged(id, draft);

  return data({
    success: true,
    draft: payload,
    newSelectionCount: payload.selections.length,
  });
}
