import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { IconDice5, IconEraser } from "@tabler/icons-react";
import { Button, IconButton } from "~/ui";
import { BuilderSection } from "./BuilderSection";
import classes from "./MapSection.module.css";
import { useDraft } from "~/draftStore";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useFullMapStats } from "~/hooks/useFullMapStats";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { useCoreSliceValues } from "~/hooks/useCoreSliceValues";

export function MapSection() {
  const config = useDraftConfig();
  const map = useDraft((state) => state.draft.presetMap);
  const draftType = useDraft((state) => state.draft.settings.type);
  const sliceValueModifiers = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.sliceValueModifiers,
  );
  const {
    randomizeMap,
    clearMap,
    removeSystemFromMap,
    addSystemToMap,
    openPlanetFinderForMap,
  } = useDraft((state) => state.actions);
  const stats = useFullMapStats();

  const isHeisenDraft = draftType === "heisen" || draftType === "heisen8p";
  const coreSliceData = useCoreSliceValues(map, sliceValueModifiers);

  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();
  const height = getBoundedMapHeight(width, windowHeight - 150);

  const handleDragEnd = (event: DragEndEvent) => {
    const [, originTileIdx] = (event.active!.id as string).split("-");
    const [, destTileIdx] = (event.over!.id as string).split("-");

    const destTile: Tile = event.over!.data.current!.tile;
    const originTile: Tile = event.active!.data.current!.tile;

    if (destTile.type !== "SYSTEM") return;
    if (originTile.type !== "SYSTEM") return;
    // do not allow move of mecatol rex!
    if (destTile.systemId === "18") return;

    const originSystem = systemData[originTile.systemId];
    const destinationSystem = systemData[destTile.systemId];

    removeSystemFromMap(parseInt(originTileIdx));
    removeSystemFromMap(parseInt(destTileIdx));
    addSystemToMap(parseInt(destTileIdx), originSystem);
    addSystemToMap(parseInt(originTileIdx), destinationSystem);
  };

  const delayedPointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(delayedPointerSensor);

  return (
    <BuilderSection
      title="Full map"
      className={classes.section}
      actions={
        <>
          {/* TODO: disable map randomization if not allowed by the draft config */}
          {config.allowIndependentMapRandomization !== false && (
            <IconButton
              variant="outline"
              label="Randomize map"
              onMouseDown={randomizeMap}
            >
              <IconDice5 />
            </IconButton>
          )}
          <Button
            size="sm"
            variant="danger"
            icon={<IconEraser />}
            onMouseDown={clearMap}
          >
            Clear
          </Button>
        </>
      }
    >
      {stats && (
        <dl className={classes.stats}>
          <div>
            <dt>Blue/red</dt>
            <dd>
              {stats.blueTiles}/{stats.redTiles}
            </dd>
          </div>
          <div>
            <dt>Resources/influence</dt>
            <dd>
              {stats.totalResources}/{stats.totalInfluence}
            </dd>
          </div>
          <div>
            <dt>Tech</dt>
            <dd>{stats.totalTech}</dd>
          </div>
          <div>
            <dt>Traits R/G/B</dt>
            <dd>
              {stats.redTraits}/{stats.greenTraits}/{stats.blueTraits}
            </dd>
          </div>
        </dl>
      )}
      <div ref={ref} className={classes.map} style={{ height }}>
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <Map
            id="fullmap"
            map={map}
            modifiableMapTiles={config.modifiableMapTiles}
            interactions={MAP_INTERACTIONS.draftBuild}
            onSelectSystemTile={(t) => openPlanetFinderForMap(t.idx)}
            onDeleteSystemTile={(t) => removeSystemFromMap(t.idx)}
            coreSliceData={isHeisenDraft ? coreSliceData : undefined}
          />
        </DndContext>
      </div>
    </BuilderSection>
  );
}
