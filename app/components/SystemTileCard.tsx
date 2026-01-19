import type { CSSProperties } from "react";
import { Surface } from "~/ui";
import type { PlayerColor } from "~/ui";
import type { SystemId } from "~/types";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { SelectionOverlay } from "~/components/SelectionOverlay";
import { FaceDownTile } from "~/components/tiles/FaceDownTile";

type Props = {
  systemId: SystemId;
  radius: number;
  selected?: boolean;
  selectedColor?: PlayerColor;
  padding?: number;
  borderRadius?: string;
  hideValues?: boolean;
  showOverlay?: boolean;
  overlaySize?: "sm" | "md";
  faceDown?: boolean;
  faceDownColor?: "blue" | "red";
  onClick?: () => void;
  style?: CSSProperties;
};

export function SystemTileCard({
  systemId,
  radius,
  selected = false,
  selectedColor = "green",
  padding = 8,
  borderRadius = "var(--mantine-radius-md)",
  hideValues = false,
  showOverlay = false,
  overlaySize = "sm",
  faceDown = false,
  faceDownColor = "blue",
  onClick,
  style,
}: Props) {
  const isInteractive = !!onClick;

  return (
    <Surface
      variant={isInteractive && !selected ? "interactive" : "card"}
      color={selected ? selectedColor : undefined}
      onClick={onClick}
      style={{
        padding,
        borderRadius,
        display: "flex",
        justifyContent: "center",
        cursor: isInteractive ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {faceDown ? (
        <FaceDownTile
          mapId={`system-tile-card-${systemId}`}
          radius={radius}
          color={faceDownColor}
        />
      ) : (
        <RawSystemTile
          mapId={`system-tile-card-${systemId}`}
          tile={{
            idx: 0,
            type: "SYSTEM",
            systemId,
            position: { x: 0, y: 0 },
          }}
          hideValues={hideValues}
          radius={radius}
          disablePopover={true}
        />
      )}
      {showOverlay && (
        <SelectionOverlay visible={selected} size={overlaySize} showBadge={false} />
      )}
    </Surface>
  );
}
