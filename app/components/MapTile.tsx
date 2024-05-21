import { System, SystemTile as SystemTileType, Tile } from "~/types";
import { SystemTile } from "./tiles/SystemTile";
import { EmptyTile } from "./tiles/EmptyTile";
import { ReactNode, useContext, useState } from "react";
import { MapContext } from "./MapContext";
import { getHexPosition } from "~/utils/positioning";
import { MecatolTile } from "./tiles/MecatolTile";
import { HomeTile } from "./tiles/HomeTile";
import { Button } from "@mantine/core";
import { Hex } from "./Hex";

import "./MapTile.css";

type Props = {
  mapId: string;
  tile: Tile;
  modifiable?: boolean;
  homeSelectable?: boolean;
  onSelect?: () => void;
};

const MECATOL_REX_ID = 18;
export function MapTile(props: Props) {
  const [hovered, setHovered] = useState(false);
  const {
    tile,
    tile: { position },
    modifiable = false,
    onSelect,
  } = props;
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: JSX.Element;
  switch (tile.type) {
    case "HOME":
      Tile = (
        <HomeTile
          mapId={props.mapId}
          tile={tile}
          selectable={!!props.homeSelectable}
          onSelect={props.onSelect}
        />
      );
      break;
    case "SYSTEM":
      Tile = <SystemTile {...props} tile={tile} />;
      break;
    default:
      Tile = <EmptyTile {...props} />;
      break;
  }

  if (tile.system?.id === MECATOL_REX_ID) {
    Tile = <MecatolTile {...props} tile={tile as SystemTileType} />;
  }

  // maybe an easier way of making this condition
  const showOverlay =
    modifiable && (hovered || tile.type === "OPEN") && tile.type !== "HOME";

  const overlayColor =
    tile.type !== "OPEN" ? "rgba(255, 255, 255, 0.70)" : "rgba(0, 0, 0, 0)";

  return (
    <div
      style={{
        position: "absolute",
        left: x + wOffset,
        top: y + hOffset,
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      {Tile}

      {showOverlay && (
        <div className="modify-tile-overlay" onMouseDown={onSelect}>
          <Hex
            id={`${props.mapId}-${tile.idx}-overlay`}
            color={overlayColor}
            radius={radius}
          >
            <Button px="6" py="4" h="auto">
              +
            </Button>
          </Hex>
        </div>
      )}
    </div>
  );
}
