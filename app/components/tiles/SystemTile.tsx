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
  // TODO: Make system tiles support multiple anomalies (for Discordant Stars)
  // currently only support one
  const anomaly = tile.system.anomalies[0];
  // TODO: Make system tiles support multiple wormholes (for Discordant Stars)
  const wormhole = tile.system.wormholes[0];

  const { radius } = useContext(MapContext);
  const scale = calcScale(radius);
  const system = tile.system;
  const image = anomaly ? (
    <AnomalyImage radius={radius} anomaly={anomaly} />
  ) : undefined;
  const showSystemId = radius >= 53;

  return (
    <Hex
      id={`${mapId}-${tile.system.id}`}
      radius={radius}
      colorClass={classes.system}
      image={image}
      anomaly={!!anomaly}
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
        {anomaly === "GRAVITY_RIFT" && <GravityRift />}
        {wormhole && <Wormhole wormhole={wormhole} />}
      </Group>
    </Hex>
  );
}
