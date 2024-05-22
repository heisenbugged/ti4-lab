import { Box } from "@mantine/core";
import { SectionTitle } from "./Section";
import { useDimensions } from "~/hooks/useDimensions";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";
import { Map } from "../Map";
import { Map as TMap } from "~/types";

type Props = {
  map: TMap;
  onSelectSystemTile: (tileIdx: number) => void;
};

export function MapSection({ map, onSelectSystemTile }: Props) {
  const { ref, width } = useDimensions<HTMLDivElement>();
  const gap = 6;
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const height = 7 * calcHexHeight(radius) + 6 * gap;

  return (
    <div style={{ position: "sticky", width: "auto", top: -10 }}>
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
          id="full-map"
          map={map}
          padding={0}
          onSelectSystemTile={onSelectSystemTile}
          mode="create"
        />
      </Box>
    </div>
  );
}
