import { Box } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraft } from "~/draftStore";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useCoreSliceValues } from "~/hooks/useCoreSliceValues";

export function MapSection() {
  const { adminMode } = useSafeOutletContext();
  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();
  const height = getBoundedMapHeight(width, windowHeight - 150);

  const config = useDraftConfig();
  const draftType = useDraft((state) => state.draft.settings.type);
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const { activePlayer, currentlyPicking, hydratedMap } = useHydratedDraft();
  const { removeSystemFromMap, openPlanetFinderForMap } = useDraft(
    (state) => state.actions,
  );
  const { syncDraft } = useSyncDraft();
  const { selectSeat } = useDraft((state) => state.draftActions);

  const isHeisenDraft = draftType === "heisen" || draftType === "heisen8p";
  const coreSliceData = useCoreSliceValues(hydratedMap, sliceValueModifiers);

  const canSelect = currentlyPicking && activePlayer?.seatIdx === undefined;

  return (
    <div style={{ position: "sticky", width: "auto", top: 60 }}>
      <SectionTitle title="Full Map" />
      <Box
        ref={ref}
        style={{
          height,
          width: "100%",
          position: "relative",
        }}
        mt="md"
      >
        <Map
          modifiableMapTiles={config.modifiableMapTiles}
          id="full-map"
          map={hydratedMap}
          onSelectHomeTile={
            canSelect
              ? (tile) => {
                  if (confirm(`Selecting seat ${(tile.seat ?? 0) + 1}`)) {
                    selectSeat(activePlayer.id, tile.seat!);
                    syncDraft();
                  }
                }
              : undefined
          }
          onSelectSystemTile={(tile) => {
            openPlanetFinderForMap(tile.idx);
          }}
          onDeleteSystemTile={(tile) => {
            removeSystemFromMap(tile.idx);
          }}
          editable={adminMode}
          coreSliceData={isHeisenDraft ? coreSliceData : undefined}
        />
      </Box>
    </div>
  );
}
