import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Box, Flex, Group } from "@mantine/core";
import { MecatolPlanet } from "../features/MecatolPlanet";
import { PlanetName } from "../PlanetName";
import { PlanetStats } from "../PlanetStats";

type Props = { tile: SystemTileType };

export function MecatolTile({ tile }: Props) {
  const system = tile.system;
  const { radius } = useContext(MapContext);

  // 70 is where 3 planets at 50px each no longer fit.
  // so we start scaling down.
  let scale = Math.min(1, radius / 70);
  if (radius > 80) {
    scale = radius / 80;
  }
  scale = scale.toString();

  return (
    <Hex
      radius={radius}
      color="#475e93"
      image={<MecatolPlanet radius={radius} />}
    >
      <Box w="75" pos="relative" style={{ scale }}>
        <Flex align="center" justify="center" bg="green">
          <PlanetStats resources={1} influence={6} />
        </Flex>
        <PlanetName>Mecatol Rex</PlanetName>
      </Box>
    </Hex>
  );
}
