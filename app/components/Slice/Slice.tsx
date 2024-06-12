import { Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { SliceMap } from "./SliceMap";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { Titles } from "../Titles";
import { SliceHeader } from "./SliceHeader";
import { DraftSlice, Player, TileRef } from "~/types";
import { useSlice } from "./useSlice";
import { SliceFeatures } from "./SliceFeatures";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";
import { IconDice6Filled } from "@tabler/icons-react";
import { DraftConfig } from "~/draft";

import classes from "./Slice.module.css";

type Props = {
  config: DraftConfig;
  id: string;
  slice: DraftSlice;
  player?: Player;
  mode: "create" | "draft";
  disabled?: boolean;
  onSelectTile?: (tile: TileRef) => void;
  onDeleteTile?: (tile: TileRef) => void;
  onSelectSlice?: () => void;
  onRandomizeSlice?: () => void;
  onClearSlize?: () => void;
};

export function Slice({
  config,
  id,
  slice,
  player,
  mode,
  disabled = false,
  onSelectTile,
  onDeleteTile,
  onSelectSlice,
  onRandomizeSlice,
  onClearSlize,
}: Props) {
  const { total, optimal } = useSlice(slice);
  const selected = !!player;

  return (
    <Paper shadow="sm">
      <Stack flex={1} gap={0}>
        <SliceHeader
          selected={selected}
          right={
            <Group>
              {mode === "create" && (
                <Group gap={2}>
                  <Button
                    size="xs"
                    onMouseDown={onRandomizeSlice}
                    color="gray.7"
                    variant="filled"
                  >
                    <IconDice6Filled size={24} />
                  </Button>
                  <Button
                    size="xs"
                    onMouseDown={onClearSlize}
                    variant="filled"
                    color="red.9"
                  >
                    Clear
                  </Button>
                </Group>
              )}
              {mode === "draft" && !selected && onSelectSlice && (
                <Button
                  lh={1}
                  py={6}
                  px={10}
                  h="auto"
                  onMouseDown={onSelectSlice}
                  variant="filled"
                  disabled={disabled}
                >
                  Select
                </Button>
              )}
            </Group>
          }
        >
          <Group>
            <Titles.Slice
              className={`${classes["slice-text"]} ${selected ? classes.selected : ""}`}
            >
              {slice.name}
            </Titles.Slice>
            {player ? <PlayerChip player={player} /> : undefined}
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
          style={{ filter: selected ? "grayscale(70%)" : "none" }}
          className={classes.map}
        >
          <SliceMap
            id={id}
            sliceHeight={config.sliceHeight}
            sliceConcentricCircles={config.sliceConcentricCircles}
            wOffsetMultiplier={config.wOffsetMultiplier}
            tiles={slice.tiles}
            onSelectTile={onSelectTile}
            onDeleteTile={onDeleteTile}
            mapModifiable={mode === "create"}
          />
        </Box>

        <Box className={classes.features}>
          <SliceFeatures slice={slice} />
        </Box>
      </Stack>
    </Paper>
  );
}
