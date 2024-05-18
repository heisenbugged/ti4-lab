import { SystemTile as SystemTileType, Tile } from "~/types";
import { SystemTile } from "./tiles/SystemTile";
import { EmptyTile } from "./tiles/EmptyTile";
import { ReactNode, useContext } from "react";
import { MapContext } from "./MapContext";
import { getHexPosition } from "~/utils/positioning";
import { MecatolTile } from "./tiles/MecatolTile";

type Props = {
  mapId: string;
  tile: Tile;
};

const MECATOL_REX_ID = 18;
export function MapTile(props: Props) {
  const {
    tile,
    tile: { position },
  } = props;
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: JSX.Element;
  switch (tile.type) {
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

  return (
    <div
      style={{
        position: "absolute",
        left: x + wOffset,
        top: y + hOffset,
      }}
    >
      {Tile}
    </div>
  );
}
