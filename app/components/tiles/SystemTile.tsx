import { useContext } from "react";
import { Hex } from "../Hex";
import { Planet } from "../Planet";
import type { SystemTile } from "~/types";
import { Group } from "@mantine/core";
import { calcScale } from "./calcScale";
import { AnomalyImage } from "../features/AnomalyImage";
import { GravityRift } from "../features/GravityRift";
import { Wormhole } from "../features/Wormhole";
import { MapContext } from "~/contexts/MapContext";
import { LegendaryImage, hasLegendaryImage } from "../LegendaryImage";
import { SystemId } from "../SystemId";
import classes from "./Tiles.module.css";
import { systemData } from "~/data/systemData";

type Props = { mapId: string; tile: SystemTile; hideValues?: boolean };

export function SystemTile({ mapId, tile, hideValues = false }: Props) {
  const { radius } = useContext(MapContext);
  const scale = calcScale(radius);
  const system = systemData[tile.systemId];

  const image = (
    <>
      {system.anomalies.map((anomaly) => (
        <AnomalyImage key={anomaly} radius={radius} anomaly={anomaly} />
      ))}
      {hasLegendaryImage(system.id) && (
        <LegendaryImage systemId={system.id} radius={radius} />
      )}
    </>
  );

  const systemIdSize = radius >= 53 ? "10px" : "8px";

  return (
    <Hex
      id={`${mapId}-${system.id}`}
      radius={radius}
      colorClass={classes.system}
      image={image}
      anomaly={system.anomalies.length > 0}
      faction={system.faction}
      hyperlanes={system.hyperlanes}
    >
      {!hideValues && (
        <SystemId id={system.id} size={systemIdSize} scale={scale} />
      )}
      <Group
        gap={4}
        justify="center"
        style={{ scale: scale.toString(), minWidth: 125, maxWidth: 125 }}
      >
        {system.planets.map((planet) => (
          <Planet
            planet={planet}
            showName={radius >= 53}
            largeFonts={radius < 53}
            key={planet.name}
            hasLegendaryImage={hasLegendaryImage(system.id)}
          />
        ))}
        {system.anomalies.includes("GRAVITY_RIFT") && <GravityRift />}
        {system.wormholes.map((wormhole) => (
          <Wormhole key={wormhole} wormhole={wormhole} />
        ))}
      </Group>
    </Hex>
  );
}
