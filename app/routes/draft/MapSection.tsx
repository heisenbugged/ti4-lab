import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useDimensions } from "~/hooks/useDimensions";
import {
  calcHexHeight,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
} from "~/utils/positioning";
import { HomeTile, MapStats, Map as TMap } from "~/types";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";
import { Map } from "~/components/Map";
import { SectionTitle } from "~/components/Section";
import { IconDice6Filled } from "@tabler/icons-react";
import { DraftConfig } from "~/draft";

type Props = {
  config: DraftConfig;
  map: TMap;
  mode: "create" | "draft";
  stats?: MapStats;
  allowSeatSelection?: boolean;
  onSelectSystemTile?: (tileIdx: number) => void;
  onDeleteSystemTile?: (tileIdx: number) => void;
  onSelectHomeTile?: (homeTile: HomeTile) => void;
  onRandomizeMap?: () => void;
  onClearMap?: () => void;
};

export function MapSection({
  config,
  map,
  stats,
  mode = "create",
  allowSeatSelection = true,
  onDeleteSystemTile,
  onSelectSystemTile,
  onSelectHomeTile,
  onRandomizeMap,
  onClearMap,
}: Props) {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const { height: windowHeight } = useWindowDimensions();

  const gap = 6;
  // Calculate preliminary height and radius bounded by width.
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const rawHeight = 7 * calcHexHeight(radius) + 6 * gap;
  const height = Math.min(rawHeight, windowHeight - 150);

  // Once preliminary height has been calculated.
  // we impose a maximum height (so that the map does not overflow)
  // and then recalculate the radius based on the new height.
  const newRadius = calculateMaxHexRadius(3, width, height, gap);
  const newHeight = 7 * calcHexHeight(newRadius) + 6 * gap;

  return (
    <div style={{ position: "sticky", width: "auto", top: 60 }}>
      <SectionTitle title="Full Map">
        {mode === "create" ? (
          <Group gap={2}>
            <Button size="xs" onMouseDown={onRandomizeMap} bg="gray">
              <IconDice6Filled size={24} />
            </Button>
            <Button size="xs" onMouseDown={onClearMap} bg="red">
              Clear
            </Button>
          </Group>
        ) : undefined}
      </SectionTitle>
      <Box
        ref={ref}
        style={{
          height: newHeight,
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
          config={config}
          id="full-map"
          map={map}
          mode={mode}
          padding={0}
          onSelectSystemTile={onSelectSystemTile}
          onDeleteSystemTile={onDeleteSystemTile}
          onSelectHomeTile={allowSeatSelection ? onSelectHomeTile : undefined}
        />
      </Box>
    </div>
  );
}
