import { useContext, useState } from "react";
import { Hex } from "../Hex";
import type { SystemTile } from "~/types";
import { MapContext } from "~/contexts/MapContext";
import { systemData } from "~/data/systemData";

import classes from "./Tiles.module.css";

type Props = { mapId: string; tile: SystemTile; children?: React.ReactNode };

export function OriginalArtTile({ mapId, tile, children }: Props) {
  const { radius } = useContext(MapContext);
  const system = systemData[tile.systemId];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${classes.tileWrapper} ${isHovered ? classes.hovered : ""}`}
      style={{
        transform: tile.rotation ? `rotate(${tile.rotation}deg)` : undefined,
      }}
    >
      <Hex
        id={`${mapId}-${system.id}`}
        radius={radius}
        image={
          <image
            href={`/tiles/ST_${system.id}.png`}
            x={-radius}
            y={-radius}
            width={radius * 2}
            height={radius * 2}
          />
        }
      >
        {children}
      </Hex>
      <div
        style={{
          position: "absolute",
          backgroundColor: "transparent",
          width: `${radius * 1.75}px`,
          height: `${radius * 1.75}px`,
          top: `${radius * 0.125}px`,
          left: `${radius * 0.125}px`,
          borderRadius: "50%",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
}
