import { useContext } from "react";
import { Hex } from "../Hex";
import { SystemTile } from "~/types";
import { Box, Flex } from "@mantine/core";
import { MecatolPlanet } from "../features/MecatolPlanet";
import { calcScale } from "./calcScale";
import { MapContext } from "~/contexts/MapContext";
import { PlanetName, PlanetStats } from "../Planet";

import classes from "./Tiles.module.css";

type Props = { mapId: string; tile: SystemTile; hideValues?: boolean };

export function MecatolTile({ mapId, tile, hideValues = false }: Props) {
  const { radius } = useContext(MapContext);
  const scale = calcScale(radius);
  return (
    <Hex
      id={`${mapId}-${tile.systemId}`}
      radius={radius}
      colorClass={classes.system}
      image={<MecatolPlanet radius={radius} />}
    >
      {!hideValues && (
        <Box
          w="75"
          pos="relative"
          style={{ scale: scale.toString(), zIndex: 1 }}
        >
          <Flex align="center" justify="center">
            <PlanetStats resources={1} influence={6} legendary />
          </Flex>
          <PlanetName size={68}>Mecatol Rex</PlanetName>
        </Box>
      )}
    </Hex>
  );
}
