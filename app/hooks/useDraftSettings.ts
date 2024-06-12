import { useDraftV2 } from "~/draftStore";

export function useDraftSettings() {
  return useDraftV2((state) => state.draft.settings);
}
