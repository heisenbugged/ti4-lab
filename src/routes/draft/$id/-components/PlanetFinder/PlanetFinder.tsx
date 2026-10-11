import { System } from "~/types";
import { useDraft } from "~/draftStore";
import { PlanetFinderBase } from "~/components/PlanetFinder";
import { useDraftConfig } from "~/hooks/useDraftConfig";

type Props = {
  onSystemSelected?: (system: System) => void;
};

export function PlanetFinder({ onSystemSelected }: Props) {
  const config = useDraftConfig();
  const planetFinderModal = useDraft((state) => state.planetFinderModal);
  const availableSystemIds = useDraft((state) => state.systemPool);
  const factionPool = useDraft((state) => state.factionPool);
  const allowHomePlanetSearch = useDraft(
    (state) =>
      state.draft.settings.allowHomePlanetSearch ||
      (state.draft.settings.minorFactionsMode?.mode === "random" &&
        state.planetFinderModal?.mode === "map" &&
        config.minorFactionsEqPositions?.includes(
          state.planetFinderModal.tileIdx,
        ) === true),
  );
  const { addSystemToMap, addSystemToSlice, closePlanetFinder } = useDraft(
    (state) => state.actions,
  );

  const handleSelectSystem = (system: System) => {
    if (!planetFinderModal) return;

    if (planetFinderModal.mode === "map") {
      addSystemToMap(planetFinderModal.tileIdx, system);
    }

    if (planetFinderModal.mode === "slice") {
      addSystemToSlice(
        planetFinderModal.sliceIdx,
        planetFinderModal.tileIdx,
        system,
      );
    }

    onSystemSelected?.(system);
    closePlanetFinder();
  };

  return (
    <PlanetFinderBase
      opened={!!planetFinderModal}
      onClose={closePlanetFinder}
      onSystemSelected={handleSelectSystem}
      availableSystemIds={availableSystemIds}
      factionPool={factionPool}
      allowHomePlanetSearch={allowHomePlanetSearch}
    />
  );
}
