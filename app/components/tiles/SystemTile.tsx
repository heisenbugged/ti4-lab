import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Group, useMantineTheme } from "@mantine/core";
import { Nebula } from "../features/Nebula";
import { Supernova } from "../features/Supernova";
import { Asteroids } from "../features/Asteroids";
// import { Text } from "tamagui";

type Props = { tile: SystemTileType };

export function SystemTile({ tile }: Props) {
  const system = tile.system;
  const { radius } = useContext(MapContext);

  // TODO: Implement this some time.
  // outlined:system.isLegendary() || system.isMecatolRexSystem(),

  // 70 is where 3 planets at 50px each no longer fit.
  // so we start scaling down.
  let scale = Math.min(1, radius / 70);
  if (radius > 80) {
    scale = radius / 80;
  }
  scale = scale.toString();

  let image;
  if (tile.system.anomaly === "NEBULA") {
    image = <Nebula radius={radius} />;
  }
  if (tile.system.anomaly === "SUPERNOVA") {
    image = <Supernova radius={radius} />;
  }
  if (tile.system.anomaly === "ASTEROID_FIELD") {
    image = <Asteroids radius={radius} />;
  }

  return (
    <Hex
      radius={radius}
      color="#475e93"
      image={image}
      anomaly={!!tile.system.anomaly}
    >
      <Group gap={2} justify="center" style={{ scale, minWidth: 102 }}>
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
