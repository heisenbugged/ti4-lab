import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Box, Flex, Group } from "@mantine/core";
import { MecatolPlanet } from "../features/MecatolPlanet";
import { PlanetName } from "../PlanetName";
import { PlanetStats } from "../PlanetStats";
import { calcScale } from "./calcScale";

type Props = { mapId: string; tile: SystemTileType };

export function MecatolTile({ mapId, tile }: Props) {
  const { radius } = useContext(MapContext);
  const scale = calcScale(radius);
  return (
    <Hex
      id={`${mapId}-${tile.system.id}`}
      radius={radius}
      color="#475e93"
      image={<MecatolPlanet radius={radius} />}
    >
      <Box w="75" pos="relative" style={{ scale: scale.toString(), zIndex: 1 }}>
        <Flex align="center" justify="center" bg="green">
          <PlanetStats resources={1} influence={6} />
        </Flex>
        <PlanetName>Mecatol Rex</PlanetName>
      </Box>
    </Hex>
  );
}
