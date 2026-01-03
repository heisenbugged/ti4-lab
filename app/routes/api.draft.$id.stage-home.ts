import { ActionFunctionArgs, data } from "react-router";
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
  HOME_PHASE,
  HomeSystemSelection,
} from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const { playerId, factionId } = (await request.json()) as {
    playerId: PlayerId;
    factionId: FactionId;
  };

  if (playerId === undefined || !factionId) {
    return data(
      { success: false, error: "Player ID and Faction ID are required" },
      { status: 400 },
    );
  }

  const existingDraft = await draftById(id);
  const draft = JSON.parse(existingDraft.data as string) as Draft;

  const currentPick = draft.pickOrder[draft.selections.length];
  if (currentPick !== HOME_PHASE) {
    return data(
      { success: false, error: "Not in home system selection phase" },
      { status: 400 },
    );
  }

  await addStagingPick(id, "home", playerId, factionId);

  const stagingState = await getStagingState(id, "home");
  const allPlayersReady =
    stagingState &&
    draft.players.every((player) => stagingState[player.id] !== undefined);

  if (allPlayersReady && stagingState) {
    const selections = draft.players.map(
      (player) =>
        ({
          playerId: player.id,
          homeSystemFactionId: stagingState[player.id],
        }) as HomeSystemSelection,
    );

    draft.selections.push({
      type: "COMMIT_HOME_SYSTEMS",
      selections,
    });

    await clearStaging(id, "home");

    const { updateDraft } = await import("~/drizzle/draft.server");
    await updateDraft(id, draft);
  }

  const latestDraft = await draftById(id);
  const latestDraftData = JSON.parse(latestDraft.data as string) as Draft;

  await broadcastDraftUpdate(id, latestDraftData);

  return data({
    success: true,
    allPlayersReady: !!allPlayersReady,
    draft: latestDraftData,
  });
}
