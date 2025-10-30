import {
  AppShell,
  Box,
  Button,
  Group,
  Text,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ClientOnly } from "remix-utils/client-only";
import { Map } from "~/components/Map";
import { MainAppShell } from "~/components/MainAppShell";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { useState, useMemo, useEffect } from "react";
import { Tile, SystemId, GameSet } from "~/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMapBuilder } from "~/mapBuilderStore";
import { MapBuilderPlanetFinder } from "~/components/MapBuilderPlanetFinder";
import {
  IconRefresh,
  IconTrash,
  IconArrowsShuffle,
  IconInfoCircle,
  IconShare,
} from "@tabler/icons-react";
import { autoCompleteMap } from "../utils/mapCompletion";
import { useMapStats } from "../utils/mapStats";
import {
  getAllSliceValues,
  getAllSliceStats,
  calculateBalanceGap,
} from "../utils/sliceScoring";
import { improveBalance } from "../utils/improveBalance";
import { TileSidebar } from "./TileSidebar";
import { SliceScoringInfoModal } from "./SliceScoringInfoModal";
import { MapStatsOverlay } from "./MapStatsOverlay";
import { systemData } from "~/data/systemData";
import { ShareMapModal } from "./ShareMapModal";
import { mapConfigs } from "~/mapgen/mapConfigs";

// Infer which game sets are used based on tile IDs
function inferGameSetsFromTiles(systemIds: SystemId[]): GameSet[] {
  const sets: Set<GameSet> = new Set(["base"]); // Always include base

  systemIds.forEach((id) => {
    const numId = Number(id);
    if (numId >= 51 && numId <= 91) {
      sets.add("pok");
    } else if (numId >= 92 && numId <= 149) {
      sets.add("te");
    } else if (numId >= 150) {
      sets.add("unchartedstars");
    }
  });

  return Array.from(sets);
}

function MapGeneratorContent() {
  const map = useMapBuilder((state) => state.state.map);
  const systemPool = useMapBuilder((state) => state.state.systemPool);
  const mapConfigId = useMapBuilder((state) => state.state.mapConfigId);
  const {
    addSystemToMap,
    removeSystemFromMap,
    openPlanetFinderForMap,
    selectSystemForPlanetFinder,
    clearMap,
    setMap,
    setGameSets,
    setMapConfig,
  } = useMapBuilder((state) => state.actions);
  const stats = useMapStats();

  // Calculate slice values and balance gap
  const sliceValues = useMemo(() => getAllSliceValues(map), [map]);
  const sliceStats = useMemo(() => getAllSliceStats(map), [map]);
  const balanceGap = useMemo(
    () => calculateBalanceGap(sliceValues),
    [sliceValues],
  );

  const [infoOpened, { open: openInfo, close: closeInfo }] =
    useDisclosure(false);
  const [shareOpened, { open: openShare, close: closeShare }] =
    useDisclosure(false);

  // Generate map string and share URL
  const mapString = useMemo(() => {
    return map
      .filter((tile) => tile.type === "SYSTEM" && tile.idx !== 0)
      .map((tile) => (tile.type === "SYSTEM" ? tile.systemId : ""))
      .join(",");
  }, [map]);

  const shareUrl = useMemo(() => {
    const systemIds = map
      .filter((tile) => tile.type === "SYSTEM" && tile.idx !== 0)
      .map((tile) => (tile.type === "SYSTEM" ? tile.systemId : ""))
      .filter(Boolean)
      .join(",");
    const baseUrl = "https://tidraft.com/map-generator";
    const params = new URLSearchParams();
    if (systemIds) {
      params.set("mapSystemIds", systemIds);
    }
    if (mapConfigId !== "milty6p") {
      params.set("mapConfig", mapConfigId);
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [map, mapConfigId]);

  // Make all tiles except Mecatol Rex (index 0) and HOME tiles modifiable
  const modifiableMapTiles = Array.from(
    { length: map.length },
    (_, i) => i,
  ).filter((i) => {
    const tile = map[i];
    return tile.type !== "HOME" && i !== 0;
  });

  const handleRandomize = () => {
    clearMap();
    const clearedMap = useMapBuilder.getState().state.map;
    const currentConfigId = useMapBuilder.getState().state.mapConfigId;
    const config = mapConfigs[currentConfigId];

    // Get preset tile indices (hyperlanes) that should not be overwritten
    const presetTileIndices = new Set(
      Object.keys(config.presetTiles).map(Number),
    );

    const completedMap = autoCompleteMap(clearedMap, systemPool);

    if (completedMap) {
      completedMap.forEach((tile, idx) => {
        // Skip Mecatol Rex (index 0), HOME tiles, and preset tiles (hyperlanes)
        if (
          tile.type === "SYSTEM" &&
          idx !== 0 &&
          !presetTileIndices.has(idx)
        ) {
          addSystemToMap(idx, tile.systemId);
        }
      });
    } else {
      // Fallback to random placement if auto-complete fails
      notifications.show({
        title: "Randomization failed",
        message:
          "Try different parameters. Using random placement as fallback.",
        color: "yellow",
      });

      const shuffledSystems = [...systemPool].sort(() => Math.random() - 0.5);
      modifiableMapTiles.forEach((tileIdx, i) => {
        // Skip preset tiles (hyperlanes) in fallback too
        if (!presetTileIndices.has(tileIdx) && i < shuffledSystems.length) {
          addSystemToMap(tileIdx, shuffledSystems[i]);
        }
      });
    }
  };

  const handleImproveBalance = () => {
    const improvedMap = improveBalance(map);
    if (improvedMap) {
      setMap(improvedMap);
    }
  };

  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);

  // Parse URL parameters and seed map on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mapSystemIds = params.get("mapSystemIds");
    const configId = params.get("mapConfig");

    // Set map config first if specified (this will clear the map)
    if (configId && mapConfigs[configId]) {
      const currentConfigId = useMapBuilder.getState().state.mapConfigId;
      if (configId !== currentConfigId) {
        setMapConfig(configId);
      }
    }

    if (mapSystemIds) {
      const systemIds = mapSystemIds.split(",").filter(Boolean) as SystemId[];

      if (systemIds.length > 0) {
        // Infer and set game sets based on tile IDs
        const inferredSets = inferGameSetsFromTiles(systemIds);
        setGameSets(inferredSets);

        // Wait for map config to be applied if needed, then add systems
        const clearedMap = useMapBuilder.getState().state.map;
        let tileIndex = 0;

        systemIds.forEach((systemId) => {
          // Find next available OPEN tile (skip Mecatol Rex at index 0)
          while (
            tileIndex < clearedMap.length &&
            (clearedMap[tileIndex].type !== "OPEN" || tileIndex === 0)
          ) {
            tileIndex++;
          }

          if (tileIndex < clearedMap.length && systemData[systemId]) {
            addSystemToMap(tileIndex, systemId);
            tileIndex++;
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      setActiveSystemId(systemId || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSystemId(null);

    if (!event.over) return;

    const activeId = event.active.id as string;
    const originTile: Tile | undefined = event.active.data.current?.tile;
    const destTile: Tile | undefined = event.over.data.current?.tile;

    // Sidebar to map drag
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      if (!systemId || !destTile) return;

      if (destTile.type !== "OPEN" && destTile.type !== "SYSTEM") return;
      if (destTile.type === "SYSTEM" && destTile.systemId === "18") return;

      addSystemToMap(destTile.idx, systemId);
      return;
    }

    // Tile-to-tile swap
    if (!originTile || !destTile) return;
    if (destTile.type !== "SYSTEM" || originTile.type !== "SYSTEM") return;
    if (destTile.systemId === "18") return; // Don't allow moving Mecatol Rex

    const originSystem = systemData[originTile.systemId];
    const destSystem = systemData[destTile.systemId];

    if (!originSystem || !destSystem) return;

    // Swap the tiles
    removeSystemFromMap(originTile.idx);
    removeSystemFromMap(destTile.idx);
    addSystemToMap(destTile.idx, originSystem.id);
    addSystemToMap(originTile.idx, destSystem.id);
  };

  const delayedPointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(delayedPointerSensor);

  const tileRadius = 60;

  return (
    <>
      <SliceScoringInfoModal opened={infoOpened} onClose={closeInfo} />
      <ShareMapModal
        mapString={mapString}
        shareUrl={shareUrl}
        opened={shareOpened}
        onClose={closeShare}
      />

      <MapBuilderPlanetFinder
        onSystemSelected={(system) => {
          selectSystemForPlanetFinder(system.id);
        }}
      />
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
            <TileSidebar />
          </AppShell.Navbar>
          <AppShell.Main p={0} h="calc(100vh - 60px)" mih="calc(100vh - 60px)">
            <Box bg="dark.7" p="sm">
              <Group justify="space-between">
                <Group>
                  <Select
                    data={Object.values(mapConfigs).map((config) => ({
                      value: config.id,
                      label: config.name,
                    }))}
                    value={mapConfigId}
                    onChange={(value) => {
                      if (value && mapConfigs[value]) {
                        setMapConfig(value);
                      }
                    }}
                    size="xs"
                    w={150}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-dark-6)",
                        borderColor: "var(--mantine-color-dark-4)",
                        color: "var(--mantine-color-gray-0)",
                      },
                    }}
                  />
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    variant="filled"
                    color="dark"
                    onClick={handleRandomize}
                    size="xs"
                  >
                    Randomize
                  </Button>
                  <Button
                    leftSection={<IconArrowsShuffle size={16} />}
                    variant="filled"
                    color="blue"
                    onClick={handleImproveBalance}
                    size="xs"
                    disabled={balanceGap === 0}
                  >
                    Improve Balance
                  </Button>
                  <Button
                    leftSection={<IconTrash size={16} />}
                    variant="filled"
                    color="red"
                    onClick={clearMap}
                    size="xs"
                  >
                    Reset
                  </Button>
                  <Button
                    leftSection={<IconShare size={16} />}
                    variant="filled"
                    color="green"
                    onClick={openShare}
                    size="xs"
                  >
                    Share
                  </Button>
                </Group>
                {balanceGap > 0 && (
                  <Group gap="xs">
                    <Text size="sm" fw={500} c="gray.0">
                      Balance Gap: {balanceGap.toFixed(1)}
                    </Text>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="md"
                      onClick={openInfo}
                      aria-label="Info about slice scoring"
                    >
                      <IconInfoCircle size={18} />
                    </ActionIcon>
                  </Group>
                )}
              </Group>
            </Box>
            <Box
              w="100%"
              pos="relative"
              style={{
                aspectRatio: "740 / 800",
                maxHeight: "calc(100vh - 140px)",
                maxWidth: "100%",
              }}
            >
              {/* Desktop: Overlay on map */}
              {stats && (
                <Box visibleFrom="sm">
                  <MapStatsOverlay stats={stats} />
                </Box>
              )}
              <Map
                id="map-generator"
                modifiableMapTiles={modifiableMapTiles}
                map={map}
                editable={true}
                disabled={false}
                onSelectSystemTile={(tile) => openPlanetFinderForMap(tile.idx)}
                onDeleteSystemTile={(tile) => removeSystemFromMap(tile.idx)}
                showHomeStats={true}
                sliceValues={sliceValues}
                sliceStats={sliceStats}
              />
            </Box>

            {/* Mobile: Stats below map */}
            {stats && (
              <Box hiddenFrom="sm" p="md" mt="lg" bg="dark.8">
                <MapStatsOverlay stats={stats} mobile />
              </Box>
            )}
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
    </>
  );
}

export default function MapGenerator() {
  return (
    <MainAppShell>
      <ClientOnly fallback={<Box w="100%" h="calc(100vh - 60px)" />}>
        {() => <MapGeneratorContent />}
      </ClientOnly>
    </MainAppShell>
  );
}
