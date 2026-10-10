import { useDraggable } from "@dnd-kit/core";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { systemData } from "~/data/systemData";
import { cx } from "~/ui";
import classes from "./TileSidebar.module.css";

type Props = {
  systemId: string;
  rotation?: number;
  selected?: boolean;
  onSelect?: (systemId: string) => void;
};

export function DraggableSidebarTile({
  systemId,
  rotation,
  selected = false,
  onSelect,
}: Props) {
  const tileRadius = 46;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${systemId}-${rotation ?? 0}`,
    data: { systemId, rotation },
  });

  const system = systemData[systemId];
  const isRedSystem = system?.type === "RED";

  return (
    <div
      className={cx(
        classes.tile,
        isRedSystem && classes.tileRed,
        selected && "ui-bracket",
        isDragging && classes.dragging,
        onSelect && classes.selectable,
      )}
      onClick={onSelect ? () => onSelect(systemId) : undefined}
    >
      <div
        ref={setNodeRef}
        className={classes.tileArt}
        style={{ width: tileRadius * 2, height: tileRadius * 1.8 }}
        {...listeners}
        {...attributes}
        aria-label={`System ${systemId}${rotation !== undefined ? `, rotation ${rotation}°` : ""}`}
      >
        <RawSystemTile
          mapId="sidebar"
          tile={{
            idx: 0,
            type: "SYSTEM",
            systemId: systemId,
            rotation,
            position: { x: 0, y: 0 },
          }}
          radius={tileRadius}
          disablePopover={true}
        />
      </div>
      {rotation !== undefined && <small>Rotation {rotation}°</small>}
    </div>
  );
}
