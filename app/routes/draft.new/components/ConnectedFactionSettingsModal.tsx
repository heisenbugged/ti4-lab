import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { useDraft } from "~/draftStore";

export function ConnectedFactionSettingsModal() {
  const opened = useDraft((state) => state.factionSettingsModal);
  const numPlayers = useDraft((state) => state.draft.players.length);
  const draftSettings = useDraft((state) => state.draft.settings);
  const { closeFactionSettings, changeFactionSettings } = useDraft(
    (state) => state.actions,
  );
  const factionPool = useDraft((state) => state.factionPool);

  return (
    <FactionSettingsModal
      opened={opened}
      factionPool={factionPool}
      factionGameSets={draftSettings.factionGameSets}
      onSave={(allowedFactions, requiredFactions, stratifiedConfig) =>
        changeFactionSettings(
          allowedFactions,
          requiredFactions,
          stratifiedConfig,
        )
      }
      numPlayers={numPlayers}
      onClose={closeFactionSettings}
      savedAllowedFactions={draftSettings.allowedFactions}
      savedRequiredFactions={draftSettings.requiredFactions}
      savedStratifiedConfig={draftSettings.factionStratification}
      buttonText="Save and reroll"
    />
  );
}
