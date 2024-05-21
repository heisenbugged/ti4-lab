import { Button, Divider, Group, Stack, Text } from "@mantine/core";
import { SliceMap } from "./SliceMap";
import { TechIcon } from "../features/TechIcon";
import { PlanetStatsPill } from "./PlanetStatsPill";

import {
  optimalStats,
  totalStats,
  parseMapString,
  techSpecialties,
} from "~/utils/map";
import { Titles } from "../Titles";
import { SliceHeader } from "./SliceHeader";
import { PlayerLabel } from "../PlayerLabel";
import { Player, System, Tile } from "~/types";

const slicePositionOrder = [
  { x: 0, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  // additional two slices for full milty draft
  { x: -1, y: -1, z: 0 },
  { x: 0, y: -2, z: 0 },
];

type Props = {
  id: string;
  name: string;
  systems: string[];
  player?: Player;
  onSelectTile?: (tile: Tile) => void;
  onSelectSlice?: () => void;
};

export function Slice({
  id,
  name,
  systems,
  player,
  onSelectTile,
  onSelectSlice,
}: Props) {
  // TODO: Ideally this parsing happens
  // in the store, and not in this render function.
  const { tiles } = parseMapString(systems, slicePositionOrder, false);
  const total = totalStats(tiles);
  const optimal = optimalStats(tiles);
  const specialties = techSpecialties(tiles);
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
          <>
            {player && (
              <PlayerLabel faction={player.faction} name={player.name} />
            )}
            <Button lh={1} py={6} px={10} h="auto" onMouseDown={onSelectSlice}>
              Select
            </Button>
          </>
        }
      >
        <Titles.Slice c={selected ? "gray.8" : "white"}>{name}</Titles.Slice>
      </SliceHeader>
      <SliceMap id={id} tiles={tiles} onSelectTile={onSelectTile} />
      <Divider mt="md" />
      <Stack gap="0">
        <Group align="center" p="sm" gap="lg">
          <Group gap="xs">
            <Text fw={600} size="sm">
              Total
            </Text>
            <PlanetStatsPill
              resources={total.resources}
              influence={total.influence}
            />
          </Group>
          <Group gap="xs">
            <Text fw={600} size="sm">
              Optimal
            </Text>
            <PlanetStatsPill
              resources={optimal.resources}
              influence={optimal.influence}
              flex={optimal.flex}
            />
          </Group>
        </Group>
        <Group
          gap="sm"
          align="center"
          bg="rgba(222 226 230)"
          px="md"
          py="sm"
          style={{
            boxShadow: "0 5px 7px rgba(0, 0, 0, 0.1) inset",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            minHeight: 50,
          }}
        >
          {specialties.map((tech) => (
            <TechIcon key={tech} techSpecialty={tech} />
          ))}
        </Group>
      </Stack>
    </Stack>
  );
}
