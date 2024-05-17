import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Group, Text } from "@mantine/core";
import { calcScale } from "./calcScale";
import { AnomalyImage } from "../features/AnomalyImage";

type Props = { tile: SystemTileType };

export function SystemTile({ tile }: Props) {
  const system = tile.system;
  const { radius } = useContext(MapContext);

  // TODO: Implement this some time.
  // outlined:system.isLegendary() || system.isMecatolRexSystem(),
  const scale = calcScale(radius).toString();
  const image = tile.system.anomaly ? (
    <AnomalyImage radius={radius} anomaly={tile.system.anomaly} />
  ) : undefined;
  const showSystemId = radius >= 51;

  return (
    <Hex
      radius={radius}
      color="#475e93"
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

      <Group gap={2} justify="center" style={{ scale }}>
        {system.planets.map((planet) => (
          <Planet
            planet={planet}
            showName={radius >= 51}
            largeFonts={radius < 51}
            key={planet.name}
          />
        ))}
      </Group>
    </Hex>
  );
}
