import { useTilePositioning } from "~/positioning";
import { Hex } from "../Hex";
import { Tile } from "~/types";
import { useContext } from "react";
import { MapContext } from "../MapContext";

type Props = { tile: Tile };

export function EmptyTile({ tile }: Props) {
  const { radius } = useContext(MapContext);
  return (
    <Hex radius={radius} color="#d6d6ea">
      +
    </Hex>
  );
}
