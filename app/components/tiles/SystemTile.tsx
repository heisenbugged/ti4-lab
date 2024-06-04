import { useContext } from "react";
import { Hex } from "../Hex";
import { Planet } from "../Planet";
import { SystemTile as SystemTileType } from "~/types";
import { Group, Text, useMantineTheme } from "@mantine/core";
import { calcScale } from "./calcScale";
import { AnomalyImage } from "../features/AnomalyImage";
import { GravityRift } from "../features/GravityRift";
import { Wormhole } from "../features/Wormhole";
import { MapContext } from "~/contexts/MapContext";

import classes from "./Tiles.module.css";

type Props = { mapId: string; tile: SystemTileType };

export function SystemTile({ mapId, tile }: Props) {
  const { radius } = useContext(MapContext);
  const scale = calcScale(radius);
  const system = tile.system;

  const image = (
    <>
      {tile.system.anomalies.map((anomaly) => (
        <AnomalyImage key={anomaly} radius={radius} anomaly={anomaly} />
      ))}
    </>
  );

  const showSystemId = radius >= 53;

  return (
    <Hex
      id={`${mapId}-${tile.system.id}`}
      radius={radius}
      colorClass={classes.system}
      image={image}
      anomaly={system.anomalies.length > 0}
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
        {tile.system.anomalies.includes("GRAVITY_RIFT") && <GravityRift />}
        {tile.system.wormholes.map((wormhole) => (
          <Wormhole key={wormhole} wormhole={wormhole} />
        ))}
      </Group>
    </Hex>
  );
}
