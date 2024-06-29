import { Tile } from "~/types";
import { SystemTile } from "./tiles/SystemTile";
import { EmptyTile } from "./tiles/EmptyTile";
import { useContext, useEffect, useState } from "react";
import { getHexPosition } from "~/utils/positioning";
import { MecatolTile } from "./tiles/MecatolTile";
import { HomeTile } from "./tiles/HomeTile";
import { Button, Stack, Text, alpha } from "@mantine/core";
import { Hex } from "./Hex";

import "./MapTile.css";
import { MapContext } from "~/contexts/MapContext";

type Props = {
  mapId: string;
  tile: Tile;
  modifiable?: boolean;
  homeSelectable?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
};

const MECATOL_REX_ID = "18";
export function MapTile(props: Props) {
  const [hovered, setHovered] = useState(false);
  const {
    tile,
    tile: { position },
    modifiable = false,
    onSelect,
    onDelete,
  } = props;
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hovered]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!hovered) return;
    if (e.key === "Delete") {
      onDelete?.();
    }
  };

  let Tile: JSX.Element | null;
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
    case "OPEN":
      Tile = <EmptyTile {...props} tile={tile} />;
      break;
    case "CLOSED":
      Tile = null;
      break;
  }

  if (tile.type === "SYSTEM" && tile.systemId === MECATOL_REX_ID) {
    Tile = <MecatolTile {...props} tile={tile} />;
  }

  // maybe an easier way of making this condition
  const showOverlay =
    modifiable && (hovered || tile.type === "OPEN") && tile.type !== "HOME";

  const overlayColor = hovered
    ? alpha("var(--mantine-primary-color-filled)", 0.7)
    : "rgba(0, 0, 0, 0)";

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

      {/* debug information */}
      {/* <div
        style={{
          position: "absolute",
          top: radius * 0.5,
          left: radius * 0.5,
          color: "white",
          backgroundColor: "black",
          padding: "2px",
        }}
      >
        <Text>{tile.idx}</Text>
      </div> */}

      {showOverlay && (
        <div className="modify-tile-overlay" onMouseDown={onSelect}>
          <Hex
            id={`${props.mapId}-${tile.idx}-overlay`}
            color={overlayColor}
            radius={radius}
          >
            <Stack gap={2}>
              <Button px="6" py="4" h="auto" variant="filled">
                +
              </Button>
              {tile.type === "SYSTEM" && (
                <Button
                  px="6"
                  py="4"
                  h="auto"
                  variant="filled"
                  bg="red"
                  size="xs"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                >
                  Del
                </Button>
              )}
            </Stack>
          </Hex>
        </div>
      )}
    </div>
  );
}
