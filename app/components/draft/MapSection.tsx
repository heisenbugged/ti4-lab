import { Box } from "@mantine/core";
import { SectionTitle } from "./Section";
import { useDimensions } from "~/hooks/useDimensions";
import {
  calcHexHeight,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
} from "~/utils/positioning";
import { Map } from "../Map";
import { HomeTile, Map as TMap } from "~/types";
import { useWindowDimensions } from "~/hooks/useWindowDimensions";

type Props = {
  map: TMap;
  mode: "create" | "draft";
  allowSeatSelection?: boolean;
  onSelectSystemTile?: (tileIdx: number) => void;
  onSelectHomeTile?: (homeTile: HomeTile) => void;
};

export function MapSection({
  map,
  mode = "create",
  allowSeatSelection = true,
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
        <Map
          id="full-map"
          map={map}
          mode={mode}
          padding={0}
          onSelectSystemTile={onSelectSystemTile}
          onSelectHomeTile={allowSeatSelection ? onSelectHomeTile : undefined}
        />
      </Box>
    </div>
  );
}
