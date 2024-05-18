import {
  Box,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Map } from "~/components/Map";
import { Slice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { TechIcon } from "~/components/features/TechIcon";
import { useDimensions } from "~/hooks/useDimensions";
import { MECATOL_TILE, parseMapString } from "~/utils/map";
import { calcHexHeight, calculateMaxHexWidthRadius } from "~/utils/positioning";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

const mapString =
  "59 33 64 71 29 62 0 30 0 32 0 26 0 69 0 27 0 20 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0";
const map = {
  tiles: [MECATOL_TILE, ...parseMapString(mapString).tiles],
};

export default function Draft() {
  const { ref, width } = useDimensions<HTMLDivElement>();

  const gap = 6;
  const radius = calculateMaxHexWidthRadius(3, width, gap);
  const height = 7 * calcHexHeight(radius) + 6 * gap;

  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 1,
        md: 1,
        lg: 2,
      }}
    >
      <Stack flex={1} p="lg">
        <Title>Slices</Title>
        <SimpleGrid
          flex={1}
          cols={{
            base: 1,
            sm: 2,
            md: 2,
            lg: 2,
          }}
          spacing="lg"
        >
          <Slice id="slice-1" mapString="0 30 23 37" />
          <Slice id="slice-2" mapString="0 38 42 70" />
          <Slice id="slice-3" mapString="0 43 71 72" />
          <Slice id="slice-4" mapString="0 61 62 67" />
          <Slice id="slice-5" mapString="0 43 71 72" />
          <Slice id="slice-6" mapString="0 61 62 67" />
        </SimpleGrid>
      </Stack>
      <Stack flex={1} p="lg" pos="relative">
        <div style={{ position: "sticky", width: "auto", top: 25 }}>
          <Title>Full Map</Title>
          <Box
            ref={ref}
            style={{
              height,
              width: "100%",
              position: "relative",
            }}
          >
            <Map id="full-map" map={map} padding={0} />
          </Box>
        </div>
      </Stack>
    </SimpleGrid>
  );
}
