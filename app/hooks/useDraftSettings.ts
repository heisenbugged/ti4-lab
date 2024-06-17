import { useDraft } from "~/draftStore";

export function useDraftSettings() {
  return useDraft((state) => state.draft.settings);
}
