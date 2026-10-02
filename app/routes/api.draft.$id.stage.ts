import { ActionFunctionArgs, data } from "react-router";
import {
  clearStagedSelections,
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
import {
  applyTexasFactionCommit,
  applyTexasTileCommit,
  isTexasTilePhase,
} from "~/draft/texas/texasDraft";
import {
  broadcastDraftWithStaged,
  draftNotFound,
  loadDraft,
} from "~/utils/draftApi.server";

function applySimultaneousCommit(
  draft: Draft,
  phase: SimultaneousPickType,
  selections: { playerId: PlayerId; value: string }[],
) {
  if (phase === "texasFaction") {
    return applyTexasFactionCommit(draft, selections);
  }

  if (isTexasTilePhase(phase)) {
    applyTexasTileCommit(draft, phase, selections);
  }

  return selections;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const id = params.id!;
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

  const draft = await loadDraft(id);
  if (!draft) return draftNotFound();

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

    draft.selections.push({
      type: "COMMIT_SIMULTANEOUS",
      phase,
      selections: applySimultaneousCommit(draft, phase, selections),
    });

    await clearStagedSelections(id, phase);
    await updateDraft(id, draft);
  }

  const latestDraft = (await loadDraft(id)) ?? draft;
  const payload = await broadcastDraftWithStaged(id, latestDraft);

  return data({
    success: true,
    allPlayersReady,
    draft: payload,
  });
}
