import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "./useHydratedDraft";

/** Puts whose pick it is at the front of the tab title, so a background tab shows it. */
export function useDraftTabTitle() {
  const { activePlayer, draftFinished } = useHydratedDraft();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);

  const turn = draftFinished
    ? "Draft done"
    : !activePlayer
      ? undefined
      : activePlayer.id === selectedPlayer
        ? "YOUR TURN"
        : `${activePlayer.name} picking`;

  useEffect(() => {
    if (!turn) return;
    const original = document.title;
    document.title = `${turn} – TI4 Lab`;
    return () => {
      document.title = original;
    };
  }, [turn]);
}
