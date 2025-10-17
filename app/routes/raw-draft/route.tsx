import { useEffect } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import { useRawDraft } from "~/rawDraftStore";
import { RawDraftPlayerSelectionScreen } from "./components/RawDraftPlayerSelectionScreen";
import { RawDraftContent } from "./components/RawDraftContent";
import { RawDraftComplete } from "./components/RawDraftComplete";

export default function RawDraftRoute() {
  const initialized = useRawDraft((state) => state.state.initialized);
  const selectedPlayer = useRawDraft((state) => state.state.selectedPlayer);
  const isDraftComplete = useRawDraft((state) => state.isDraftComplete());
  const { initializeDraft, setSelectedPlayer } = useRawDraft(
    (state) => state.actions,
  );

  // Auto-initialize draft on mount
  useEffect(() => {
    if (!initialized) {
      initializeDraft();
    }
  }, [initialized, initializeDraft]);

  const handlePlayerSelected = (playerId: number) => {
    setSelectedPlayer(playerId);
  };

  if (!initialized) {
    return <MainAppShell>Loading...</MainAppShell>;
  }

  if (isDraftComplete) {
    return (
      <MainAppShell>
        <RawDraftComplete />
      </MainAppShell>
    );
  }

  if (selectedPlayer === undefined) {
    return (
      <MainAppShell>
        <RawDraftPlayerSelectionScreen onDraftJoined={handlePlayerSelected} />
      </MainAppShell>
    );
  }

  return (
    <MainAppShell>
      <RawDraftContent />
    </MainAppShell>
  );
}
