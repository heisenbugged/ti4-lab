import { draftConfig } from "~/draft";
import { useDraftV2 } from "~/draftStore";

export function useDraftConfig() {
  const draftType = useDraftV2((state) => state.draft.settings.type);
  return draftConfig[draftType];
}
