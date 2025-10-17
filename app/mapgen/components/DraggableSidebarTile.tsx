import { Box, Card, alpha } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { systemData } from "~/data/systemData";

type Props = {
  systemId: string;
};

export function DraggableSidebarTile({ systemId }: Props) {
  const tileRadius = 60;
  const tileWidth = tileRadius * 2;
  const tileHeight = tileRadius * 2;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${systemId}`,
    data: { systemId },
  });

  const system = systemData[systemId];
  const isRedSystem = system?.type === "RED";

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isRedSystem ? alpha("var(--mantine-color-red-8)", 0.15) : undefined,
        borderColor: isRedSystem ? alpha("var(--mantine-color-red-8)", 0.3) : undefined,
      }}
    >
      <Box
        ref={setNodeRef}
        style={{
          position: "relative",
          width: tileWidth,
          height: tileHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          cursor: "grab",
        }}
        {...listeners}
        {...attributes}
      >
        <RawSystemTile
          mapId="sidebar"
          tile={{
            idx: 0,
            type: "SYSTEM",
            systemId: systemId,
            position: { x: 0, y: 0 },
          }}
          radius={tileRadius}
          disablePopover={true}
        />
      </Box>
    </Card>
  );
}
