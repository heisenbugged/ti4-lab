import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import {
  Box,
  Group,
  Text,
  useMantineContext,
  useMantineTheme,
} from "@mantine/core";
import { calcScale } from "./calcScale";
import { AnomalyImage } from "../features/AnomalyImage";
import { GravityRift } from "../features/GravityRift";

type Props = { mapId: string; tile: SystemTileType };

export function SystemTile({ mapId, tile }: Props) {
  const system = tile.system;
  const { radius } = useContext(MapContext);

  // TODO: Implement this some time.
  // outlined:system.isLegendary() || system.isMecatolRexSystem(),
  const scale = calcScale(radius);
  const image = tile.system.anomaly ? (
    <AnomalyImage radius={radius} anomaly={tile.system.anomaly} />
  ) : undefined;
  const showSystemId = radius >= 51;
  const { colors } = useMantineTheme();

  return (
    <Hex
      id={`${mapId}-${tile.system.id}`}
      radius={radius}
      color={colors.spaceBlue[8]}
      image={image}
      anomaly={!!tile.system.anomaly}
    >
      {showSystemId && (
        <Text
          size="10"
          lh="1"
          c="white"
          pos="absolute"
          top={15 * scale}
          fw="bolder"
        >
          {tile.system.id}
        </Text>
      )}

      <Group
        gap={4}
        justify="center"
        style={{ scale: scale.toString(), minWidth: 110, maxWidth: 110 }}
      >
        {system.planets.map((planet) => (
          <Planet
            planet={planet}
            showName={radius >= 53}
            largeFonts={radius < 53}
            key={planet.name}
          />
        ))}
        {system.anomaly === "GRAVITY_RIFT" && <GravityRift />}
      </Group>
    </Hex>
  );
}
