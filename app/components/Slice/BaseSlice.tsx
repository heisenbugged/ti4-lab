import {
  Box,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconHelpCircleFilled } from "@tabler/icons-react";
import { SliceMap } from "./SliceMap";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { SliceHeader } from "./SliceHeader";
import { Slice, Tile } from "~/types";
import { useSlice } from "./useSlice";
import { SliceFeatures } from "./SliceFeatures";

import classes from "./Slice.module.css";
import { DraftConfig } from "~/draft";
import { Titles } from "../Titles";

type Props = {
  id: string;
  config: DraftConfig;
  slice: Slice;
  mapModifiable?: boolean;
  selectedColor?: string;
  // greyOut?: boolean;
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  onNameChange?: (name: string) => void;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
};

export function BaseSlice({
  id,
  config,
  slice,
  titleLeft,
  titleRight,
  mapModifiable = false,
  selectedColor,
  onSelectTile,
  onDeleteTile,
  onNameChange,
}: Props) {
  const { optimal, sliceValue } = useSlice(slice);
  return (
    <Paper
      shadow="sm"
      style={{ opacity: selectedColor ? 0.5 : 1 }}
      className={selectedColor ? classes[selectedColor] : ""}
    >
      <Stack flex={1} gap={0}>
        <SliceHeader right={titleRight}>
          <Group flex={1}>
            {mapModifiable && onNameChange ? (
              <TextInput
                className={classes.editableSliceName}
                value={slice.name}
                mr="xs"
                fw="bold"
                w="auto"
                flex={1}
                onChange={(e) => onNameChange?.(e.target.value)}
              />
            ) : (
              <Titles.Slice className={`${classes["slice-text"]}`}>
                {slice.name}
              </Titles.Slice>
            )}
            {titleLeft}
          </Group>
        </SliceHeader>

        <Group className={classes.stats} justify="space-between">
          <Group gap={6}>
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              SV
            </Text>
            <Text size="sm" fw={700} c="yellow.5">
              {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
            </Text>
            <Tooltip
              label="Slice Value (SV) = optimal resources + influence + flex, plus bonuses for tech skips (+0.5), legendaries (+1 to +3), and entropic scar."
              multiline
              w={280}
              withArrow
              events={{ hover: true, focus: true, touch: true }}
            >
              <Box
                component="span"
                style={{
                  cursor: "help",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconHelpCircleFilled
                  size={14}
                  color="var(--mantine-color-dimmed)"
                />
              </Box>
            </Tooltip>
          </Group>
          <Group gap={6}>
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              Opt
            </Text>
            <PlanetStatsPill
              resources={optimal.resources}
              influence={optimal.influence}
              flex={optimal.flex}
            />
            <Text size="xs" c="dimmed">
              ({optimal.resources + optimal.influence + optimal.flex})
            </Text>
          </Group>
        </Group>

        <Box className={classes.map}>
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
