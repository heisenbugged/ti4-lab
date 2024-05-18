import { Divider, Group, Stack, Text } from "@mantine/core";
import { SliceMap } from "./SliceMap";
import { TechIcon } from "../features/TechIcon";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { SliceTitle } from "./SliceTitle";
import {
  optimalStats,
  totalStats,
  parseMapString,
  techSpecialties,
} from "~/utils/map";

const slicePositionOrder = [
  { x: 0, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: -1, z: 0 },
  // additional two slices for full milty draft
  { x: -1, y: -1, z: 0 },
  { x: 0, y: -2, z: 0 },
];

export function Slice({ id, mapString }: { id: string; mapString: string }) {
  const { tiles } = parseMapString(mapString, slicePositionOrder);

  const total = totalStats(tiles);
  const optimal = optimalStats(tiles);
  const specialties = techSpecialties(tiles);

  return (
    <Stack
      flex={1}
      gap={0}
      style={{
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <SliceTitle>Slice 1</SliceTitle>
      <SliceMap id={id} tiles={tiles} />
      <Divider mt="md" />
      <Stack gap="0">
        <Group align="center" p="sm" gap="lg">
          <Group gap="xs">
            <Text fw={600}>Total</Text>
            <PlanetStatsPill
              resources={total.resources}
              influence={total.influence}
            />
          </Group>
          <Group gap="xs">
            <Text fw={600}>Optimal</Text>
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
            borderBottom: "2px solid white",
          }}
        >
          <Text c="gray.8" tt="uppercase" fw="bold" size="sm">
            Features
          </Text>
          {specialties.map((tech) => (
            <TechIcon key={tech} techSpecialty={tech} />
          ))}
        </Group>
      </Stack>
    </Stack>
  );
}
