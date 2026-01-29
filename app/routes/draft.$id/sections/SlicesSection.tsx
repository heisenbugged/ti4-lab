import { SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { DraftableSlice } from "../components/DraftableSlice";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export function SlicesSection() {
  const slices = useDraft((state) => state.draft.slices);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const nucleusStyle = useDraft((state) => state.draft.settings.nucleusStyle);

  const { adminMode } = useSafeOutletContext();
  const { selectSlice } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { activePlayer, hydratedPlayers, currentlyPicking } =
    useHydratedDraft();

  const {
    removeSystemFromSlice,
    openPlanetFinderForSlice,
    updateSliceName,
    randomizeSlice,
    clearSlice,
  } = useDraft((state) => state.actions);

  const canSelect = currentlyPicking && activePlayer?.sliceIdx === undefined;

  const isTwilightsFallFullWidth =
    draftGameMode === "twilightsFall" && !nucleusStyle;
  const gridCols = isTwilightsFallFullWidth
    ? { base: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }
    : { base: 1, sm: 2, md: 3, lg: 2, xxl: 3 };

  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
        <SectionTitle title="Slices" />
      </div>

      <SimpleGrid
        flex={1}
        cols={gridCols}
        spacing="lg"
        style={{ alignItems: "flex-start" }}
      >
        {slices.map((slice, idx) => (
          <DraftableSlice
            key={idx}
            id={`slice-${idx}`}
            slice={slice}
            player={hydratedPlayers.find((p) => p.sliceIdx === idx)}
            modifiable={adminMode}
            onSelect={
              canSelect
                ? () => {
                    if (confirm(`Selecting ${slice.name}`)) {
                      selectSlice(activePlayer.id, idx);
                      syncDraft();
                    }
                  }
                : undefined
            }
            onSelectTile={
              adminMode
                ? (tile) => openPlanetFinderForSlice(idx, tile.idx)
                : undefined
            }
            onDeleteTile={
              adminMode
                ? (tile) => removeSystemFromSlice(idx, tile.idx)
                : undefined
            }
            onRandomizeSlice={adminMode ? () => randomizeSlice(idx) : undefined}
            onClearSlice={adminMode ? () => clearSlice(idx) : undefined}
            onNameChange={adminMode ? (name) => updateSliceName(idx, name) : undefined}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
