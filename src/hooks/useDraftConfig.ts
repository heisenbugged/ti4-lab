import { draftConfig } from "~/draft";
import { useDraft } from "~/draftStore";

export function useDraftConfig() {
  const draftType = useDraft((state) => state.draft.settings.type);
  return draftConfig[draftType];
}
