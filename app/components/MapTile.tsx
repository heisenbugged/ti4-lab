import { createPortal } from "react-dom";

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
import { OriginalArtTile } from "./tiles/OriginalArtTile";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import {
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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
  const { originalArt } = useSafeOutletContext();
  if (originalArt) return <OriginalArtMapTile {...props} />;
  return <AbstractArtMapTile {...props} />;
}

function OriginalArtMapTile(props: Props) {
  const {
    mapId,
    tile,
    tile: { position },
  } = props;
  const { hOffset, wOffset, radius, gap } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: JSX.Element | null;
  switch (tile.type) {
    case "HOME":
      Tile = (
        <HomeTile
          mapId={mapId}
          tile={tile}
          selectable={!!props.homeSelectable}
          onSelect={props.onSelect}
        />
      );
      break;
    case "SYSTEM":
      Tile = <OriginalArtTile {...props} tile={tile} />;
      break;
    case "OPEN":
      Tile = <EmptyTile {...props} tile={tile} />;
      break;
    case "CLOSED":
      Tile = null;
      break;
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

function AbstractArtMapTile(props: Props) {
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

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${props.mapId}-${tile.idx}-draggable`,
    data: { tile },
    disabled: tile.type !== "SYSTEM" || isTouchDevice(),
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `${props.mapId}-${tile.idx}-droppable`,
    data: { tile },
    disabled: tile.type !== "SYSTEM" || isTouchDevice(),
  });

  useEffect(() => {
    setHovered(false);
  }, [isOver, isDragging]);

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 2 : undefined,
      }
    : undefined;

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
    <>
      <div
        ref={setNodeRef}
        style={{
          position: "absolute",
          left: x + wOffset,
          top: y + hOffset,
          ...dragStyle,
        }}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        {...listeners}
        {...attributes}
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

        {showOverlay && !isDragging && !isOver && (
          <div className="modify-tile-overlay" onMouseUp={onSelect}>
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
                    onMouseUp={(e) => {
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
    </>
  );
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
