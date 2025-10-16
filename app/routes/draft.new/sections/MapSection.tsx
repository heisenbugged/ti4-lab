import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import { getBoundedMapHeight } from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { IconDice6Filled } from "@tabler/icons-react";
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
import { PlayerSelection, Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { hydrateMap } from "~/utils/map";

export function MapSection() {
  const config = useDraftConfig();
  const map = useDraft((state) => state.draft.presetMap);
  const {
    randomizeMap,
    clearMap,
    removeSystemFromMap,
    addSystemToMap,
    openPlanetFinderForMap,
  } = useDraft((state) => state.actions);
  const stats = useFullMapStats();

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
    <div style={{ position: "sticky", width: "auto", top: 60 }}>
      <SectionTitle title="Full Map">
        <Group gap={2}>
          {/* TODO: disable map randomization if not allowed by the draft config */}
          {config.allowIndependentMapRandomization !== false && (
            <Button size="xs" onMouseDown={randomizeMap} bg="gray">
              <IconDice6Filled size={24} />
            </Button>
          )}
          <Button size="xs" onMouseDown={clearMap} bg="red">
            Clear
          </Button>
        </Group>
      </SectionTitle>
      <Box
        ref={ref}
        style={{
          height,
          width: "100%",
          position: "relative",
        }}
        mt="md"
      >
        {stats && (
          <Stack pos="absolute" top={0} right={0} gap={1} visibleFrom="xs">
            <Text size="sm" ta="right">
              Blue/Red: {stats.blueTiles}/{stats.redTiles}
            </Text>
            <Text size="sm" ta="right">
              Resources/Influence: {stats.totalResources}/{stats.totalInfluence}
            </Text>
            <Text size="sm" ta="right">
              Tech: {stats.totalTech}
            </Text>
            <Text size="sm" ta="right">
              Traits R/G/B: {stats.redTraits}/{stats.greenTraits}/
              {stats.blueTraits}
            </Text>
          </Stack>
        )}
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <Map
            id="fullmap"
            map={map}
            modifiableMapTiles={config.modifiableMapTiles}
            editable
            onSelectSystemTile={(t) => openPlanetFinderForMap(t.idx)}
            onDeleteSystemTile={(t) => removeSystemFromMap(t.idx)}
          />
        </DndContext>
      </Box>
    </div>
  );
}
