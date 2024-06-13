import { Box } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraftV2 } from "~/draftStore";

export function MapSection() {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();
  const height = getBoundedMapHeight(width, windowHeight - 150);

  const config = useDraftConfig();
  const { activePlayer, currentlyPicking, hydratedMap } = useHydratedDraft();
  const { syncing, syncDraft } = useSyncDraft();
  const { selectSeat } = useDraftV2((state) => state.draftActions);

  const canSelect = currentlyPicking && !activePlayer?.seatIdx;

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
          config={config}
          id="full-map"
          map={hydratedMap}
          onSelectHomeTile={
            canSelect
              ? (tile) => {
                  selectSeat(activePlayer.id, tile.seat!);
                  syncDraft();
                }
              : undefined
          }
          disabled={syncing}
          // TODO should be editable if admin mode is on
          editable={false}
        />
      </Box>
    </div>
  );
}
