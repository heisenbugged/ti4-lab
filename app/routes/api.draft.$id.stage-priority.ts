import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  draftById,
  addStagingPick,
  getStagingState,
  clearStaging,
} from "~/drizzle/draft.server";
import {
  Draft,
  FactionId,
  PlayerId,
  PRIORITY_PHASE,
  PriorityValueSelection,
} from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return json(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const { playerId, factionId } = (await request.json()) as {
    playerId: PlayerId;
    factionId: FactionId;
  };

  if (playerId === undefined || !factionId) {
    return json(
      { success: false, error: "Player ID and Faction ID are required" },
      { status: 400 },
    );
  }

  const existingDraft = await draftById(id);
  const draft = JSON.parse(existingDraft.data as string) as Draft;

  const currentPick = draft.pickOrder[draft.selections.length];
  if (currentPick !== PRIORITY_PHASE) {
    return json(
      { success: false, error: "Not in priority value selection phase" },
      { status: 400 },
    );
  }

  await addStagingPick(id, "priority", playerId, factionId);

  const stagingState = await getStagingState(id, "priority");
  const allPlayersReady =
    stagingState &&
    draft.players.every((player) => stagingState[player.id] !== undefined);

  if (allPlayersReady && stagingState) {
    const selections = draft.players.map(
      (player) =>
        ({
          playerId: player.id,
          priorityValueFactionId: stagingState[player.id],
        }) as PriorityValueSelection,
    );

    draft.selections.push({
      type: "COMMIT_PRIORITY_VALUES",
      selections,
    });

    await clearStaging(id, "priority");

    const { updateDraft } = await import("~/drizzle/draft.server");
    await updateDraft(id, draft);
  }

  const latestDraft = await draftById(id);
  const latestDraftData = JSON.parse(latestDraft.data as string) as Draft;

  await broadcastDraftUpdate(id, latestDraftData);

  return json({
    success: true,
    allPlayersReady: !!allPlayersReady,
    draft: latestDraftData,
  });
}
