import { System } from "~/types";
import { useMapBuilder } from "~/mapBuilderStore";
import { PlanetFinderBase } from "~/components/PlanetFinder";

type Props = {
  onSystemSelected?: (system: System) => void;
};

export function MapBuilderPlanetFinder({ onSystemSelected }: Props) {
  const planetFinderModal = useMapBuilder((state) => state.planetFinderModal);
  const availableSystemIds = useMapBuilder((state) => state.systemPool);
  const factionPool = useMapBuilder((state) => state.factionPool);
  const allowHomePlanetSearch = useMapBuilder(
    (state) => state.draft.settings.allowHomePlanetSearch,
  );
  const { addSystemToMap, closePlanetFinder } = useMapBuilder(
    (state) => state.actions,
  );

  const handleSelectSystem = (system: System) => {
    if (!planetFinderModal) return;

    if (planetFinderModal.mode === "map") {
      addSystemToMap(planetFinderModal.tileIdx, system.id, system.rotation);
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
