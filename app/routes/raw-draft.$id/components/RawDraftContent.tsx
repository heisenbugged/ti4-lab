import { AppShell, Box, Text, Group } from "@mantine/core";
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
import { RawDraftProvider } from "~/contexts/RawDraftContext";
import { useRawDraftPlayerId } from "~/hooks/useRawDraftPlayerId";
import { MapStatsOverlay } from "~/mapgen/components/MapStatsOverlay";
import { calculateMapStats } from "~/mapgen/utils/mapStats";
import {
  getAllSliceValues,
  calculateBalanceGap,
} from "~/mapgen/utils/sliceScoring";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";

type RawDraftContentProps = {
  onTilePlaced?: () => void;
};

export function RawDraftContent({ onTilePlaced }: RawDraftContentProps) {
  const draftId = useRawDraft((store) => store.draftId);
  const map = useRawDraft((store) => store.getMap());
  const players = useRawDraft((store) => store.state.players);
  const pickOrder = useRawDraft((store) => store.state.pickOrder);
  const currentPickNumber = useRawDraft((store) =>
    store.getCurrentPickNumber(),
  );
  const activePlayer = useRawDraft((store) => store.getActivePlayer());
  const [playerId] = useRawDraftPlayerId(draftId);
  const currentRing = useRawDraft((store) => store.getCurrentPlaceableRing());
  const { placeTile } = useRawDraft((store) => store.actions);
  const showStatsDisplay = useRawDraft(
    (store) => store.state.showStatsDisplay ?? true,
  );

  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);

  // Check if the current user can place tiles (must be the current turn player, not a spectator)
  const canPlaceTiles =
    playerId !== undefined &&
    playerId !== -1 &&
    activePlayer !== undefined &&
    playerId === activePlayer.id;

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
    // Prevent dragging if it's not the current user's turn
    if (!canPlaceTiles) {
      console.warn("Cannot drag tiles - it's not your turn");
      return;
    }

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

      console.log("[Client] Placing tile:", {
        mapIdx: destTile.idx,
        systemId,
        activePlayer: activePlayer?.id,
      });
      if (playerId !== undefined) {
        placeTile(destTile.idx, systemId, playerId);
      }
      // Sync state to DB and broadcast to other players
      console.log("[Client] Tile placed, calling onTilePlaced callback");
      onTilePlaced?.();
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
  const modifiableMapTiles = useMemo(() => {
    if (!canPlaceTiles) {
      return [];
    }
    return getPlaceableTileIndices(activeSystemId || undefined);
  }, [getPlaceableTileIndices, activeSystemId, canPlaceTiles]);

  const stats = useMemo(() => calculateMapStats(map), [map]);

  // Calculate slice values and balance gap
  const sliceValues = useMemo(() => getAllSliceValues(map), [map]);
  const balanceGap = useMemo(
    () => calculateBalanceGap(sliceValues),
    [sliceValues],
  );

  const playerColorAssignments = useRawDraft(
    (store) => store.state.playerColorAssignments,
  );
  const playerFactions = useRawDraft((store) => store.state.playerFactions);

  return (
    <RawDraftProvider
      players={players}
      playerColorAssignments={playerColorAssignments}
      playerFactions={playerFactions}
    >
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
                <Group gap="md" justify="center" align="center">
                  <Text size="sm" fw={600} c="blue.4">
                    Placing: {ringNames[currentRing as 1 | 2 | 3]}
                  </Text>
                  {showStatsDisplay && balanceGap > 0 && (
                    <Text size="sm" fw={500} c="gray.0">
                      Balance Gap: {balanceGap.toFixed(1)}
                    </Text>
                  )}
                  <OriginalArtToggle />
                </Group>
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
              {showStatsDisplay && stats && (
                <Box visibleFrom="sm">
                  <MapStatsOverlay stats={stats} />
                </Box>
              )}
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
