import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { SliceMap } from "./SliceMap";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { Titles } from "../Titles";
import { SliceHeader } from "./SliceHeader";
import { Slice, Tile } from "~/types";
import { useSlice } from "./useSlice";
import { SliceFeatures } from "./SliceFeatures";
import { useDraftConfig } from "~/hooks/useDraftConfig";

import classes from "./Slice.module.css";

type Props = {
  id: string;
  slice: Slice;
  mapModifiable?: boolean;
  greyOut?: boolean;
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
};

export function BaseSlice({
  id,
  slice,
  titleLeft,
  titleRight,
  mapModifiable = false,
  greyOut = false,
  onSelectTile,
  onDeleteTile,
}: Props) {
  const config = useDraftConfig();
  const { total, optimal } = useSlice(slice);
  return (
    <Paper shadow="sm">
      <Stack flex={1} gap={0}>
        <SliceHeader selected={greyOut} right={titleRight}>
          <Group>
            <Titles.Slice
              className={`${classes["slice-text"]} ${greyOut ? classes.selected : ""}`}
            >
              {slice.name}
            </Titles.Slice>
            {titleLeft}
          </Group>
        </SliceHeader>

        <Group className={classes.stats}>
          <PlanetStatsPill
            resources={optimal.resources}
            influence={optimal.influence}
            flex={optimal.flex}
          />
          <Text fw={600} size="sm">
            /
          </Text>
          <PlanetStatsPill
            size="xs"
            resources={total.resources}
            influence={total.influence}
          />
        </Group>

        <Box
          style={{ filter: greyOut ? "grayscale(70%)" : "none" }}
          className={classes.map}
        >
          <SliceMap
            id={id}
            sliceHeight={config.sliceHeight}
            sliceConcentricCircles={config.sliceConcentricCircles}
            wOffsetMultiplier={config.wOffsetMultiplier}
            tiles={slice.tiles}
            mapModifiable={mapModifiable}
            onSelectTile={onSelectTile}
            onDeleteTile={onDeleteTile}
          />
        </Box>

        <Box className={classes.features}>
          <SliceFeatures slice={slice} />
        </Box>
      </Stack>
    </Paper>
  );
}
