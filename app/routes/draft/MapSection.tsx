import { Box, Stack, Text } from "@mantine/core";
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

type Props = {
  map: TMap;
  mode: "create" | "draft";
  stats?: MapStats;
  allowSeatSelection?: boolean;
  onSelectSystemTile?: (tileIdx: number) => void;
  onDeleteSystemTile?: (tileIdx: number) => void;
  onSelectHomeTile?: (homeTile: HomeTile) => void;
};

export function MapSection({
  map,
  stats,
  mode = "create",
  allowSeatSelection = true,
  onDeleteSystemTile,
  onSelectSystemTile,
  onSelectHomeTile,
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
      <SectionTitle title="Full Map" />
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
