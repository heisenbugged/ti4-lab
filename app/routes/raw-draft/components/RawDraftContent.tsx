import { AppShell, Box, Text } from "@mantine/core";
import { useState, useMemo } from "react";
import { Map } from "~/components/Map";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { Tile } from "~/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRawDraft } from "~/rawDraftStore";
import { PlayerTilesSidebar } from "./PlayerTilesSidebar";
import { RawCurrentPickBanner } from "./RawCurrentPickBanner";
import { RawDraftOrderWrapper } from "./RawDraftOrderWrapper";
import { systemData } from "~/data/systemData";
import { RawDraftProvider } from "~/contexts/RawDraftContext";

export function RawDraftContent() {
  const map = useRawDraft((state) => state.getMap());
  const players = useRawDraft((state) => state.state.players);
  const pickOrder = useRawDraft((state) => state.state.pickOrder);
  const currentPickNumber = useRawDraft((state) =>
    state.getCurrentPickNumber(),
  );
  const activePlayer = useRawDraft((state) => state.getActivePlayer());
  const selectedPlayer = useRawDraft((state) => state.state.selectedPlayer);
  const currentRing = useRawDraft((state) => state.getCurrentPlaceableRing());
  const { placeTile } = useRawDraft((state) => state.actions);

  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);

  const ringNames = {
    1: "Inner Ring",
    2: "Middle Ring",
    3: "Outer Ring",
  } as const;

  // Convert players to HydratedPlayer format for DraftOrder
  const hydratedPlayers = useMemo(
    () =>
      players.map((p) => ({
        id: p.id,
        name: p.name,
        hasDiscord: false,
      })),
    [players],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      setActiveSystemId(systemId || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const draggedSystemId = activeSystemId;
    setActiveSystemId(null);

    if (!event.over) return;

    const activeId = event.active.id as string;
    const destTile: Tile | undefined = event.over.data.current?.tile;

    // Only allow sidebar to map drag
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      if (!systemId || !destTile) return;

      // Only allow dropping on OPEN tiles
      if (destTile.type !== "OPEN") return;

      // Don't allow placing on index 0 (Mecatol Rex)
      if (destTile.idx === 0) return;

      // Verify the destination is in the list of valid placeable tiles
      // This ensures the drop matches the visual highlighting
      const validTiles = getPlaceableTileIndices(draggedSystemId || undefined);
      if (!validTiles.includes(destTile.idx)) {
        console.warn(
          `Drop rejected: Tile ${destTile.idx} is not in the list of valid placeable tiles.`,
          `System: ${systemId}, Valid tiles:`,
          validTiles,
          `Map state at drop:`,
          map
            .filter((t) => t.type === "SYSTEM")
            .map((t) => ({
              idx: t.idx,
              systemId: t.type === "SYSTEM" ? t.systemId : null,
            })),
        );
        return;
      }

      placeTile(destTile.idx, systemId);
    }
  };

  const delayedPointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(delayedPointerSensor);

  const tileRadius = 60;

  // Get placeable tile indices from the store (only tiles in current ring)
  // If dragging an anomaly, this will filter out adjacent positions
  const getPlaceableTileIndices = useRawDraft(
    (state) => state.getPlaceableTileIndices,
  );
  const modifiableMapTiles = useMemo(
    () => getPlaceableTileIndices(activeSystemId || undefined),
    [getPlaceableTileIndices, activeSystemId],
  );

  return (
    <RawDraftProvider players={players}>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <AppShell
          navbar={{
            width: 250,
            breakpoint: "sm",
            collapsed: { mobile: true },
          }}
          padding={0}
        >
          <AppShell.Navbar p={0} visibleFrom="sm">
            <PlayerTilesSidebar />
          </AppShell.Navbar>
          <AppShell.Main p={0} h="calc(100vh - 60px)" mih="calc(100vh - 60px)">
            {/* Current pick banner - absolutely positioned */}
            <Box
              pos="absolute"
              top={0}
              left={250}
              right={0}
              style={{ zIndex: 100 }}
            >
              <RawCurrentPickBanner
                title={
                  activePlayer
                    ? `It's ${activePlayer.name}'s turn to place a tile!`
                    : undefined
                }
              />
            </Box>

            {/* Draft order */}
            <Box bg="dark.7" p="sm" pt="80px">
              <Box
                mb="xs"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Text size="sm" fw={600} c="blue.4">
                  Placing: {ringNames[currentRing as 1 | 2 | 3]}
                </Text>
              </Box>
              <RawDraftOrderWrapper
                pickOrder={pickOrder}
                currentPick={currentPickNumber}
                players={hydratedPlayers}
              />
            </Box>

            {/* Map */}
            <Box
              w="100%"
              pos="relative"
              style={{
                aspectRatio: "740 / 800",
                maxHeight: "calc(100vh - 240px)",
                maxWidth: "100%",
              }}
            >
              <Map
                id="raw-draft-map"
                modifiableMapTiles={modifiableMapTiles}
                map={map}
                editable={false}
                disabled={false}
                droppable={true}
              />
            </Box>
          </AppShell.Main>
        </AppShell>
        <DragOverlay dropAnimation={null}>
          {activeSystemId ? (
            <RawSystemTile
              mapId="drag-overlay"
              tile={{
                idx: 0,
                type: "SYSTEM",
                systemId: activeSystemId,
                position: { x: 0, y: 0 },
              }}
              radius={tileRadius}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </RawDraftProvider>
  );
}
