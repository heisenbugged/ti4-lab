import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import {
  calcHexHeight,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
} from "~/utils/positioning";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { IconDice6Filled } from "@tabler/icons-react";
import { useDraftV2 } from "~/draftStore";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { useFullMapStats } from "~/hooks/useFullMapStats";

export function MapSection() {
  const config = useDraftConfig();
  const map = useDraftV2((state) => state.draft.presetMap);
  const {
    randomizeMap,
    clearMap,
    removeSystemFromMap,
    openPlanetFinderForMap,
  } = useDraftV2((state) => state.actions);
  const stats = useFullMapStats();

  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();
  const height = getBoundedMapHeight(width, windowHeight - 150);

  return (
    <div style={{ position: "sticky", width: "auto", top: 60 }}>
      <SectionTitle title="Full Map">
        <Group gap={2}>
          {/* TODO: disable map randomization if not allowed by the draft config */}
          <Button size="xs" onMouseDown={randomizeMap} bg="gray">
            <IconDice6Filled size={24} />
          </Button>
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
        <Map
          id="full-map"
          map={map}
          config={config}
          editable
          onSelectSystemTile={(t) => openPlanetFinderForMap(t.idx)}
          onDeleteSystemTile={(t) => removeSystemFromMap(t.idx)}
        />
      </Box>
    </div>
  );
}

/**
 *
 * For a given 'width', calculate the height of the map bounding box.
 * Where it cannot exceed 'maxHeight'.
 */
function getBoundedMapHeight(width: number, maxHeight: number) {
  const gap = 6;
  // Calculate preliminary height and radius bounded by width.
  const initialRadius = calculateMaxHexWidthRadius(3, width, gap);
  const initialHeight = 7 * calcHexHeight(initialRadius) + 6 * gap;

  // Once preliminary height has been calculated.
  // we impose a maximum height (so that the map does not overflow)
  // and then recalculate the radius based on the new height.
  const height = Math.min(initialHeight, maxHeight);
  const newRadius = calculateMaxHexRadius(3, width, height, gap);
  const newHeight = 7 * calcHexHeight(newRadius) + 6 * gap;

  return newHeight;
}
