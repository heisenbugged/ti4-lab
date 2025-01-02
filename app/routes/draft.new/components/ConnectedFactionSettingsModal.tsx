import { useEffect, useState } from "react";
import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { useDraft } from "~/draftStore";
import { FactionId } from "~/types";

export function ConnectedFactionSettingsModal() {
  const opened = useDraft((state) => state.factionSettingsModal);
  const draftSettings = useDraft((state) => state.draft.settings);
  const { closeFactionSettings, changeFactionSettings } = useDraft(
    (state) => state.actions,
  );
  const factionPool = useDraft((state) => state.factionPool);

  const [allowedFactions, setAllowedFactions] = useState<FactionId[]>([]);
  const [requiredFactions, setRequiredFactions] = useState<FactionId[]>([]);

  useEffect(() => {
    if (!opened) return;
    setAllowedFactions(draftSettings.allowedFactions ?? []);
    setRequiredFactions(draftSettings.requiredFactions ?? []);
  }, [opened]);

  return (
    <FactionSettingsModal
      opened={opened}
      factionPool={factionPool}
      onSave={() =>
        changeFactionSettings(allowedFactions ?? [], requiredFactions ?? [])
      }
      onClose={closeFactionSettings}
      allowedFactions={allowedFactions ?? []}
      requiredFactions={requiredFactions ?? []}
      setAllowedFactions={setAllowedFactions}
      setRequiredFactions={setRequiredFactions}
      buttonText="Save and reroll"
    />
  );
}
