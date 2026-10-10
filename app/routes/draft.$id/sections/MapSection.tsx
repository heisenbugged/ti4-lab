import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useDraft } from "~/draftStore";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useCoreSliceValues } from "~/hooks/useCoreSliceValues";
import { ReactNode } from "react";
import { ButtonAnchor, Panel, Tag } from "~/ui";
import { IconShare } from "@tabler/icons-react";
import { encodeMapString } from "~/mapgen/utils/mapStringCodec";
import { usePendingPick } from "../components/pendingPick";
import classes from "./MapSection.module.css";

type Props = {
  titleChildren?: ReactNode;
};

const draftTypeLabel = (type: string) => {
  if (type.startsWith("miltyeq")) return "Milty EQ";
  if (type.startsWith("milty")) return "Milty";
  if (type.startsWith("heisen")) return "Nucleus";
  if (type.startsWith("std")) return "Standard";
  return type;
};

/** The full map. Open home systems are seat picks while you still need a seat. */
export function MapSection({ titleChildren }: Props) {
  const { adminMode } = useSafeOutletContext();
  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();
  const isPhone = width > 0 && width < 600;
  const height = getBoundedMapHeight(
    width,
    // Same bound as the original layout, so the map is never smaller than it used to be.
    isPhone ? windowHeight : windowHeight - 150,
  );

  const config = useDraftConfig();
  const draftType = useDraft((state) => state.draft.settings.type);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const playerCount = useDraft((state) => state.draft.players.length);
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const { activePlayer, currentlyPicking, hydratedMap, draftFinished } =
    useHydratedDraft();
  const { removeSystemFromMap, openPlanetFinderForMap } = useDraft(
    (state) => state.actions,
  );
  const { syncDraft } = useSyncDraft();
  const { selectSeat } = useDraft((state) => state.draftActions);
  const { select, pending } = usePendingPick();

  const isHeisenDraft = draftType === "heisen" || draftType === "heisen8p";
  const coreSliceData = useCoreSliceValues(hydratedMap, sliceValueModifiers);

  const canSelect = currentlyPicking && activePlayer?.seatIdx === undefined;
  const canEditMap = adminMode;
  const mapInteractions = {
    ...(canEditMap ? MAP_INTERACTIONS.draftBuild : MAP_INTERACTIONS.readonly),
    allowHomeSelect: canSelect,
  };

  return (
    <Panel
      well
      flush
      className={classes.panel}
      title="Full map"
      action={
        <>
          {draftFinished && (
            // Map-only image (the header's Share image is the whole draft summary).
            <ButtonAnchor
              size="sm"
              href={`/map-generator.png?map=${encodeURIComponent(encodeMapString(hydratedMap))}`}
              target="_blank"
              rel="noreferrer"
              icon={<IconShare size={15} />}
            >
              Share map
            </ButtonAnchor>
          )}
          {titleChildren ?? (
          <>
            <Tag>{playerCount}P</Tag>
            {draftGameMode === "presetMap" ? (
              <Tag tone="ion">Preset map</Tag>
            ) : (
              <Tag tone="ion">{draftTypeLabel(draftType)}</Tag>
            )}
          </>
          )}
        </>
      }
    >
      {canSelect && !draftFinished && (
        <p className={classes.hint}>
          Your seat is still open: select a home system to pick it.
        </p>
      )}
      <div ref={ref} className={classes.map} style={{ height }}>
        <Map
          modifiableMapTiles={config.modifiableMapTiles}
          id="full-map"
          map={hydratedMap}
          interactions={mapInteractions}
          onSelectHomeTile={
            canSelect && activePlayer
              ? (tile) => {
                  if (tile.seat === undefined) return;
                  const seat = tile.seat;
                  select({
                    key: `seat-${seat}`,
                    label: `Seat ${seat + 1}`,
                    commit: () => {
                      selectSeat(activePlayer.id, seat);
                      syncDraft();
                    },
                  });
                }
              : undefined
          }
          onSelectSystemTile={
            canEditMap ? (tile) => openPlanetFinderForMap(tile.idx) : undefined
          }
          onDeleteSystemTile={
            canEditMap ? (tile) => removeSystemFromMap(tile.idx) : undefined
          }
          pendingSeat={pending?.key.startsWith("seat-") ? Number(pending.key.slice(5)) : undefined}
          coreSliceData={isHeisenDraft ? coreSliceData : undefined}
        />
      </div>
    </Panel>
  );
}
