import { Box, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { SliceMap } from "./SliceMap";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { Titles } from "../Titles";
import { SliceHeader } from "./SliceHeader";
import { Player, Tile } from "~/types";
import { useSlice } from "./useSlice";
import { SliceFeatures } from "./SliceFeatures";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";
import { MapConfig } from "~/utils/map";

type Props = {
  config: MapConfig;
  id: string;
  name: string;
  systems: string[];
  player?: Player;
  mode: "create" | "draft";
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  onSelectSlice?: () => void;
};

export function Slice({
  config,
  id,
  name,
  systems,
  player,
  mode,
  onSelectTile,
  onDeleteTile,
  onSelectSlice,
}: Props) {
  const { tiles, total, optimal } = useSlice(config, systems);
  const selected = !!player;

  return (
    <Stack
      flex={1}
      gap={0}
      style={{
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <SliceHeader
        selected={selected}
        right={
          <Group>
            <Group align="center" gap="xs">
              <PlanetStatsPill
                resources={optimal.resources}
                influence={optimal.influence}
                flex={optimal.flex}
              />
              <Text fw={600} size="sm" c="white">
                /
              </Text>
              <PlanetStatsPill
                size="xs"
                resources={total.resources}
                influence={total.influence}
              />
            </Group>

            {mode === "draft" && !selected && onSelectSlice && (
              <Button
                lh={1}
                py={6}
                px={10}
                h="auto"
                onMouseDown={onSelectSlice}
                variant="filled"
              >
                Select
              </Button>
            )}
          </Group>
        }
      >
        <Group>
          <Titles.Slice c={selected ? "gray.8" : "white"}>{name}</Titles.Slice>
          {player ? <PlayerChip player={player} /> : undefined}
        </Group>
      </SliceHeader>
      <div style={{ filter: selected ? "grayscale(70%)" : "none" }}>
        <SliceMap
          id={id}
          sliceHeight={config.sliceHeight}
          tiles={tiles}
          onSelectTile={onSelectTile}
          onDeleteTile={onDeleteTile}
          mode={mode}
        />
      </div>

      <Divider mt="md" />
      <Box
        bg="rgba(222 226 230)"
        style={{
          boxShadow: "0 5px 7px rgba(0, 0, 0, 0.1) inset",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          minHeight: 50,
        }}
        px="md"
        py="sm"
      >
        <SliceFeatures slice={systems} />
      </Box>
    </Stack>
  );
}
