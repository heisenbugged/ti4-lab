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
import { systemData } from "~/data/systemData";

import classes from "./Tiles.module.css";

type RawProps = {
  mapId: string;
  tile: SystemTile;
  hideValues?: boolean;
  radius: number;
  disablePopover?: boolean;
};

export function RawSystemTile({ mapId, tile, hideValues = false, radius, disablePopover = false }: RawProps) {
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
    <div
      style={{
        transform: tile.rotation ? `rotate(${tile.rotation}deg)` : undefined,
      }}
    >
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
          <SystemId
            id={system.id}
            size={systemIdSize}
            scale={scale}
            rotation={tile.rotation ? -tile.rotation : 0}
            highlight={system.type === "HYPERLANE"}
            radius={radius}
          />
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
              disablePopover={disablePopover}
            />
          ))}
          {system.anomalies.includes("GRAVITY_RIFT") && <GravityRift />}
          {system.wormholes.map((wormhole) => (
            <Wormhole key={wormhole} wormhole={wormhole} />
          ))}
        </Group>
      </Hex>
    </div>
  );
}

type Props = { mapId: string; tile: SystemTile; hideValues?: boolean; disablePopover?: boolean };

export function SystemTile({ mapId, tile, hideValues = false, disablePopover = false }: Props) {
  const { radius } = useContext(MapContext);
  return <RawSystemTile mapId={mapId} tile={tile} hideValues={hideValues} radius={radius} disablePopover={disablePopover} />;
}
