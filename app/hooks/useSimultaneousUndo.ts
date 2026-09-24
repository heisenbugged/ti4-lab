import { useDraft } from "~/draftStore";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { PlayerId, SimultaneousPickType } from "~/types";

export function useSimultaneousUndo(
  phase: SimultaneousPickType,
  currentPlayerId: PlayerId | undefined,
  stagingValues: Record<number, string> | undefined,
) {
  const { undoStagedPick, undoSimultaneousPhase } = useSyncDraft();
  const selections = useDraft((state) => state.draft.selections);

  const hasAnyStagedSelections =
    !!stagingValues && Object.keys(stagingValues).length > 0;
  const canUndoPick =
    currentPlayerId !== undefined
      ? stagingValues?.[currentPlayerId] !== undefined
      : false;

  const handleUndoPick = async () => {
    if (currentPlayerId === undefined) return;
    if (confirm("Undo the staged pick for this player?")) {
      await undoStagedPick(phase, currentPlayerId);
    }
  };

  const handleUndoPhase = async () => {
    if (
      confirm(
        "Undo this phase? This clears all staged picks and moves back one step.",
      )
    ) {
      await undoSimultaneousPhase(phase);
    }
  };

  return {
    handleUndoPick,
    handleUndoPhase,
    undoPickDisabled: !canUndoPick,
    undoPhaseDisabled: !hasAnyStagedSelections && selections.length === 0,
  };
}
