import { Box, Button, Group, Modal, Text } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraft } from "~/draftStore";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useCoreSliceValues } from "~/hooks/useCoreSliceValues";
import { ReactNode, useState } from "react";

type Props = {
  titleChildren?: ReactNode;
};

export function MapSection({ titleChildren }: Props) {
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
  const [pendingSeat, setPendingSeat] = useState<number | null>(null);

  const isHeisenDraft = draftType === "heisen" || draftType === "heisen8p";
  const coreSliceData = useCoreSliceValues(hydratedMap, sliceValueModifiers);

  const canSelect = currentlyPicking && activePlayer?.seatIdx === undefined;
  const canEditMap = adminMode;
  const mapInteractions = {
    ...(canEditMap ? MAP_INTERACTIONS.draftBuild : MAP_INTERACTIONS.readonly),
    allowHomeSelect: canSelect,
  };

  const handleConfirmSeat = () => {
    if (!activePlayer || pendingSeat === null) return;
    selectSeat(activePlayer.id, pendingSeat);
    syncDraft();
    setPendingSeat(null);
  };

  return (
    <div style={{ position: "sticky", width: "auto", top: 60 }}>
      <SectionTitle title="Full Map">{titleChildren}</SectionTitle>
      <Modal
        opened={pendingSeat !== null}
        onClose={() => setPendingSeat(null)}
        title="Confirm seat selection"
        centered
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleConfirmSeat();
          }
        }}
      >
        <Text size="sm" mb="md">
          {activePlayer
            ? `Assign ${activePlayer.name} to seat ${pendingSeat !== null ? pendingSeat + 1 : "-"}?`
            : "Select this seat?"}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setPendingSeat(null)}>
            Cancel
          </Button>
          <Button color="green" onClick={handleConfirmSeat} autoFocus>
            Confirm
          </Button>
        </Group>
      </Modal>
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
          interactions={mapInteractions}
          onSelectHomeTile={
            canSelect
              ? (tile) => {
                  if (tile.seat === undefined) return;
                  setPendingSeat(tile.seat);
                }
              : undefined
          }
          onSelectSystemTile={
            canEditMap ? (tile) => openPlanetFinderForMap(tile.idx) : undefined
          }
          onDeleteSystemTile={
            canEditMap ? (tile) => removeSystemFromMap(tile.idx) : undefined
          }
          coreSliceData={isHeisenDraft ? coreSliceData : undefined}
        />
      </Box>
    </div>
  );
}
