import { ActionFunctionArgs, json } from "@remix-run/node";
import { draftById, updateDraft } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return json(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { expectedSelectionCount?: number };

  const existingDraft = await draftById(id);
  if (!existingDraft) {
    return json({ success: false, error: "Draft not found" }, { status: 404 });
  }

  const draft = JSON.parse(existingDraft.data as string) as Draft;

  if (
    body.expectedSelectionCount !== undefined &&
    body.expectedSelectionCount !== draft.selections.length
  ) {
    return json(
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
    return json(
      { success: false, error: "No selections to undo" },
      { status: 400 },
    );
  }

  const removedSelection = draft.selections.pop();

  await updateDraft(id, draft);
  await broadcastDraftUpdate(id, draft);

  return json({
    success: true,
    removedSelection,
    draft,
    newSelectionCount: draft.selections.length,
  });
}
