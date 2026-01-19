import { ActionFunctionArgs, data } from "react-router";
import {
  clearStagedSelections,
  draftById,
  getDraftStagedSelections,
  getStagedSelections,
  updateDraft,
  upsertStagedSelection,
} from "~/drizzle/draft.server";
import {
  Draft,
  SimultaneousPickType,
  PlayerId,
  PRIORITY_PHASE,
  HOME_PHASE,
} from "~/types";
import { broadcastDraftUpdate } from "~/websocket/broadcast.server";
import {
  applyTexasFactionCommit,
  applyTexasTileCommit,
} from "~/draft/texas/texasDraft";

function applySimultaneousCommit(
  draft: Draft,
  phase: SimultaneousPickType,
  selections: { playerId: PlayerId; value: string }[],
) {
  if (phase === "texasFaction") {
    const resolved = applyTexasFactionCommit(draft, selections);
    return { selections: resolved };
  }

  if (phase === "texasBlueKeep1" || phase === "texasBlueKeep2" || phase === "texasRedKeep") {
    applyTexasTileCommit(draft, phase, selections);
    return { selections };
  }

  return { selections };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data(
      { success: false, error: "Draft ID is required" },
      { status: 400 },
    );
  }

  const { playerId, value, phase } = (await request.json()) as {
    playerId: PlayerId;
    value: string;
    phase: SimultaneousPickType;
  };

  if (playerId === undefined || value === undefined || !phase) {
    return data(
      { success: false, error: "Player ID, phase, and value are required" },
      { status: 400 },
    );
  }

  const existingDraft = await draftById(id);
  const draft = JSON.parse(existingDraft.data as string) as Draft;

  const currentPick = draft.pickOrder[draft.selections.length];
  const isLegacyPhase =
    (phase === "priorityValue" && currentPick === PRIORITY_PHASE) ||
    (phase === "homeSystem" && currentPick === HOME_PHASE);

  if (
    !isLegacyPhase &&
    (typeof currentPick !== "object" ||
      currentPick.kind !== "simultaneous" ||
      currentPick.phase !== phase)
  ) {
    return data(
      { success: false, error: "Not in simultaneous selection phase" },
      { status: 400 },
    );
  }

  await upsertStagedSelection(id, phase, playerId, value);

  const stagingState = await getStagedSelections(id, phase);
  const allPlayersReady = draft.players.every(
    (player) => stagingState[player.id] !== undefined,
  );

  if (allPlayersReady) {
    const selections = draft.players.map((player) => ({
      playerId: player.id,
      value: stagingState[player.id],
    }));

    const { selections: resolvedSelections } = applySimultaneousCommit(
      draft,
      phase,
      selections,
    );

    draft.selections.push({
      type: "COMMIT_SIMULTANEOUS",
      phase,
      selections: resolvedSelections,
    });

    await clearStagedSelections(id, phase);
    await updateDraft(id, draft);
  }

  const latestDraft = await draftById(id);
  const latestDraftData = JSON.parse(latestDraft.data as string) as Draft;
  const stagedSelections = await getDraftStagedSelections(id);
  const payload = { ...latestDraftData, stagedSelections };

  await broadcastDraftUpdate(id, payload);

  return data({
    success: true,
    allPlayersReady: !!allPlayersReady,
    draft: payload,
  });
}
