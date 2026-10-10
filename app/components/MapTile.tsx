import { Tile } from "~/types";
import { SystemTile } from "./tiles/SystemTile";
import { EmptyTile } from "./tiles/EmptyTile";
import { ClosedTile } from "./tiles/ClosedTile";
import { useContext, useEffect, useState, useMemo, type JSX } from "react";
import { getHexPosition } from "~/utils/positioning";
import { MecatolTile } from "./tiles/MecatolTile";
import { HomeTile } from "./tiles/HomeTile";
import { Hex } from "./Hex";

import "./MapTile.css";
import { MapContext } from "~/contexts/MapContext";
import { OriginalArtTile } from "./tiles/OriginalArtTile";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import type { SliceValueBreakdown } from "~/stats";
import type { TileContribution, SliceStats } from "~/mapgen/utils/sliceScoring";
import { ContributionBadge } from "./tiles/ContributionBadge";
import { getSafeWindow } from "~/hooks/useWindowDimensions";

type Props = {
  mapId: string;
  tile: Tile;
  modifiable?: boolean;
  droppable?: boolean;
  hoverEffects?: boolean;
  ringHighlight?: boolean;
  homeSelectable?: boolean;
  homeSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  sliceValue?: number;
  sliceStats?: SliceStats;
  sliceBreakdown?: SliceValueBreakdown;
  coreSliceData?: CoreSliceData;
  tileContribution?: TileContribution;
  isHomeHovered?: boolean;
  hoveredHomeIdx?: number | null;
  onHomeHover?: (idx: number | null) => void;
  closeTileMode?: boolean;
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
          selected={!!props.homeSelected}
          onSelect={props.onSelect}
          sliceValue={props.sliceValue}
          sliceStats={props.sliceStats}
          coreSliceData={props.coreSliceData}
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
    droppable = false,
    hoverEffects = true,
    ringHighlight = false,
    onSelect,
    onDelete,
    tileContribution,
    hoveredHomeIdx,
    onHomeHover,
    closeTileMode = false,
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
    disabled:
      (tile.type !== "SYSTEM" && tile.type !== "HOME") || isTouchDevice(),
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `${props.mapId}-${tile.idx}-droppable`,
    data: { tile },
    disabled: !(modifiable || droppable) || isTouchDevice(),
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

  // Convert sliceBreakdown to coreSliceData format if provided
  const derivedCoreSliceData: CoreSliceData | undefined = useMemo(() => {
    if (props.coreSliceData) return props.coreSliceData;
    if (props.sliceBreakdown) {
      return {
        value: props.sliceBreakdown.total,
        systems: [],
        breakdown: props.sliceBreakdown,
      };
    }
    return undefined;
  }, [props.coreSliceData, props.sliceBreakdown]);

  let Tile: JSX.Element | null;

  switch (tile.type) {
    case "HOME":
      Tile = (
        <HomeTile
          mapId={props.mapId}
          tile={tile}
          selectable={!!props.homeSelectable}
          selected={!!props.homeSelected}
          onSelect={props.onSelect}
          sliceValue={props.sliceValue}
          sliceStats={props.sliceStats}
          coreSliceData={derivedCoreSliceData}
          onHomeHover={onHomeHover}
        />
      );
      break;
    case "SYSTEM":
      Tile = <SystemTile {...props} tile={tile} disablePopover={isDragging} />;
      break;
    case "OPEN":
      Tile = (
        <EmptyTile
          {...props}
          tile={tile}
          isOver={isOver}
          ringHighlight={ringHighlight}
          hoverEffects={hoverEffects}
        />
      );
      break;
    case "CLOSED":
      Tile = (
        <ClosedTile
          mapId={props.mapId}
          tileIdx={tile.idx}
          closeTileMode={closeTileMode}
        />
      );
      break;
  }

  if (tile.type === "SYSTEM" && tile.systemId === MECATOL_REX_ID) {
    Tile = <MecatolTile {...props} tile={tile} disablePopover={isDragging} />;
  }

  // Show overlay on modifiable tiles when hovered or being dropped on
  // HOME tiles are draggable/droppable but don't show the modification overlay
  // Don't show overlay when in close tile mode
  const showOverlay =
    modifiable &&
    hoverEffects &&
    !closeTileMode &&
    tile.type !== "HOME" &&
    tile.type !== "CLOSED" &&
    (hovered || tile.type === "OPEN" || isOver);

  const overlayColor = hovered
    ? "color-mix(in srgb, var(--ion) 45%, transparent)"
    : isOver
      ? "color-mix(in srgb, var(--ion) 22%, transparent)"
      : "rgba(0, 0, 0, 0)";

  // Determine if tile should be dimmed when a home is being hovered
  // Dim if: hoveredHomeIdx is set AND this tile has no contribution to that home
  // Don't dim: the hovered home itself, tiles that contribute
  const isHomeHoverActive =
    hoveredHomeIdx !== null && hoveredHomeIdx !== undefined;
  const isThisTheHoveredHome =
    tile.type === "HOME" && tile.idx === hoveredHomeIdx;
  const shouldDim =
    isHomeHoverActive && !isThisTheHoveredHome && !tileContribution;

  // Show contribution badge if tile has partial contribution (equidistantCount > 1)
  const showContributionBadge =
    isHomeHoverActive &&
    tileContribution &&
    tileContribution.equidistantCount > 1;

  // Cursor style for close tile mode
  const cursorStyle =
    closeTileMode && tile.type !== "HOME" && tile.idx !== 0
      ? { cursor: "crosshair" }
      : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        className={[shouldDim ? "tile-dimmed" : undefined, "map-tile-button"]
          .filter(Boolean)
          .join(" ")}
        style={{
          position: "absolute",
          left: x + wOffset,
          top: y + hOffset,
          ...dragStyle,
          ...cursorStyle,
        }}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={closeTileMode ? onSelect : undefined}
        {...listeners}
        {...attributes}
      >
        {Tile}

        {/* Contribution badge for equidistant tiles */}
        {showContributionBadge && tileContribution && (
          <ContributionBadge percentage={tileContribution.percentage} />
        )}

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
          {tile.idx}
        </div> */}

        {showOverlay && !isDragging && !isOver && (
          <div className="modify-tile-overlay" onMouseUp={onSelect}>
            <Hex
              id={`${props.mapId}-${tile.idx}-overlay`}
              color={overlayColor}
              radius={radius}
            >
              <div className="map-tile-tools">
                <button type="button" className="map-tile-tool" aria-label="Add or replace a system">
                  +
                </button>
                {tile.type === "SYSTEM" && (
                  <button
                    type="button"
                    className="map-tile-tool map-tile-tool--danger"
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                  >
                    Del
                  </button>
                )}
              </div>
            </Hex>
          </div>
        )}
      </div>
    </>
  );
}

function isTouchDevice() {
  const safeWindow = getSafeWindow();
  if (!safeWindow) return false;
  return (
    "ontouchstart" in safeWindow ||
    (safeWindow.navigator?.maxTouchPoints ?? 0) > 0
  );
}
