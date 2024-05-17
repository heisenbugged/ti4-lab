import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Group, useMantineTheme } from "@mantine/core";
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

  const hasNebula = tile.system.anomaly === "NEBULA";

  return (
    <Hex
      radius={radius}
      color="#576d9f"
      imageUrl={hasNebula ? "/nebula.webp" : undefined}
      anomaly={!!tile.system.anomaly}
    >
      {/* <div className="id">{system.id}</div> */}
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
