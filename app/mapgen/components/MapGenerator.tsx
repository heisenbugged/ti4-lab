import {
  AppShell,
  Box,
  Button,
  Group,
  Text,
  ActionIcon,
  Select,
  MultiSelect,
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
  IconPhoto,
  IconWand,
  IconMinus,
  IconPlus,
  IconHexagonOff,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { draftConfig } from "~/draft/draftConfig";
import {
  mapConfigToCompatibleDraftTypes,
  extractSlicesFromMap,
  buildPresetMap,
  encodeSeededMapData,
  SeededMapData,
} from "../utils/mapToDraft";
import { autoCompleteMap } from "../utils/mapCompletion";
import { useMapStats } from "../utils/mapStats";
import {
  getAllSliceValues,
  getAllSliceStats,
  getAllSliceBreakdowns,
  calculateBalanceGap,
  getAllTileContributions,
} from "../utils/sliceScoring";
import { improveBalance } from "../utils/improveBalance";
import { TileSidebar } from "./TileSidebar";
import { SliceScoringInfoModal } from "./SliceScoringInfoModal";
import { MapStatsOverlay } from "./MapStatsOverlay";
import { systemData } from "~/data/systemData";
import { ShareMapModal } from "./ShareMapModal";
import { mapConfigs } from "~/mapgen/mapConfigs";
import { DraftTypeSelectionModal } from "./DraftTypeSelectionModal";
import { DraftType } from "~/draft/types";

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
  const navigate = useNavigate();
  const map = useMapBuilder((state) => state.state.map);
  const systemPool = useMapBuilder((state) => state.state.systemPool);
  const mapConfigId = useMapBuilder((state) => state.state.mapConfigId);
  const gameSets = useMapBuilder((state) => state.state.gameSets);
  const ringCount = useMapBuilder((state) => state.state.ringCount);
  const hoveredHomeIdx = useMapBuilder((state) => state.state.hoveredHomeIdx);
  const closeTileMode = useMapBuilder((state) => state.state.closeTileMode);
  const closedTiles = useMapBuilder((state) => state.state.closedTiles);
  const {
    addSystemToMap,
    removeSystemFromMap,
    swapTiles,
    openPlanetFinderForMap,
    clearMap,
    setMap,
    setGameSets,
    setMapConfig,
    setRingCount,
    setHoveredHomeIdx,
    toggleCloseTileMode,
    toggleTileClosed,
  } = useMapBuilder((state) => state.actions);
  const stats = useMapStats();

  // Calculate slice values, stats, breakdowns, tile contributions, and balance gap
  const sliceValues = useMemo(
    () => getAllSliceValues(map, undefined, undefined, ringCount),
    [map, ringCount],
  );
  const sliceStats = useMemo(() => getAllSliceStats(map), [map]);
  const sliceBreakdowns = useMemo(
    () => getAllSliceBreakdowns(map, undefined, ringCount),
    [map, ringCount],
  );
  const tileContributions = useMemo(() => getAllTileContributions(map), [map]);
  const balanceGap = useMemo(
    () => calculateBalanceGap(sliceValues),
    [sliceValues],
  );

  const [infoOpened, { open: openInfo, close: closeInfo }] =
    useDisclosure(false);
  const [shareOpened, { open: openShare, close: closeShare }] =
    useDisclosure(false);
  const [draftTypeOpened, { open: openDraftType, close: closeDraftType }] =
    useDisclosure(false);
  const [compatibleDraftTypes, setCompatibleDraftTypes] = useState<DraftType[]>(
    [],
  );

  // Generate map string and share URL
  const mapString = useMemo(() => {
    return map
      .slice(1) // Skip Mecatol Rex at index 0
      .map((tile) => {
        if (tile.type === "HOME") return "0";
        if (tile.type === "SYSTEM") return tile.systemId;
        return "-1";
      })
      .join(" ");
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

  const imageUrl = useMemo(() => {
    const systemIds = map
      .filter((tile) => tile.type === "SYSTEM" && tile.idx !== 0)
      .map((tile) => (tile.type === "SYSTEM" ? tile.systemId : ""))
      .filter(Boolean)
      .join(",");
    const baseUrl = "https://tidraft.com/map-generator.png";
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

  // Check if map is complete (no OPEN tiles, excluding closed tiles)
  const isMapComplete = useMemo(() => {
    return !map.some((tile, idx) => {
      // Skip tiles that are in closedTiles
      if (closedTiles.includes(idx)) return false;
      return tile.type === "OPEN" || tile.type === "CLOSED";
    });
  }, [map, closedTiles]);

  // Make all tiles except Mecatol Rex (index 0) and closed tiles modifiable
  // Use closedTiles array as source of truth, not tile.type
  const modifiableMapTiles = Array.from(
    { length: map.length },
    (_, i) => i,
  ).filter((i) => {
    return i !== 0 && !closedTiles.includes(i);
  });

  const handleRandomize = () => {
    // Get current map state - preserve hyperlanes and home systems
    const currentMap = useMapBuilder.getState().state.map;

    // Identify indices to preserve (hyperlanes and home systems)
    const preserveIndices = new Set<number>();
    preserveIndices.add(0); // Always preserve Mecatol Rex

    currentMap.forEach((tile, idx) => {
      if (tile.type === "HOME") {
        preserveIndices.add(idx);
      } else if (tile.type === "SYSTEM") {
        const system = systemData[tile.systemId];
        if (system?.type === "HYPERLANE") {
          preserveIndices.add(idx);
        }
      }
    });

    // Clear non-preserved system tiles
    currentMap.forEach((tile, idx) => {
      if (tile.type === "SYSTEM" && !preserveIndices.has(idx)) {
        removeSystemFromMap(idx);
      }
    });

    // Get the partially cleared map and current closed tiles
    const partialMap = useMapBuilder.getState().state.map;
    const currentClosedTiles = useMapBuilder.getState().state.closedTiles;

    const completedMap = autoCompleteMap(partialMap, systemPool, currentClosedTiles);

    if (completedMap) {
      completedMap.forEach((tile, idx) => {
        // Only add to non-preserved positions
        if (tile.type === "SYSTEM" && !preserveIndices.has(idx)) {
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
      let systemIdx = 0;
      modifiableMapTiles.forEach((tileIdx) => {
        // Skip preserved tiles (hyperlanes, homes)
        if (!preserveIndices.has(tileIdx) && systemIdx < shuffledSystems.length) {
          addSystemToMap(tileIdx, shuffledSystems[systemIdx]);
          systemIdx++;
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

  const handleCreateDraft = () => {
    const compatibleTypes = mapConfigToCompatibleDraftTypes[mapConfigId];
    if (!compatibleTypes || compatibleTypes.length === 0) {
      notifications.show({
        title: "Unsupported",
        message: "This map type doesn't support draft creation",
        color: "red",
      });
      return;
    }

    // If multiple compatible types, show selection modal
    if (compatibleTypes.length > 1) {
      setCompatibleDraftTypes(compatibleTypes);
      openDraftType();
      return;
    }

    // Single compatible type - navigate directly
    navigateToDraft(compatibleTypes[0]);
  };

  const navigateToDraft = (selectedDraftType: DraftType) => {
    const compatibleTypes = mapConfigToCompatibleDraftTypes[mapConfigId];
    const config = draftConfig[selectedDraftType];
    const mapConfig = mapConfigs[mapConfigId];
    const { slices, sliceTileIndices } = extractSlicesFromMap(
      map,
      mapConfig,
      config,
    );
    const presetMap = buildPresetMap(map, sliceTileIndices);

    const seededData: SeededMapData = {
      slices,
      presetMap,
      mapConfigId,
      // Pass all compatible types so user can switch between them in prechoice
      compatibleDraftTypes: compatibleTypes,
      gameSets,
    };

    const encoded = encodeSeededMapData(seededData);
    // Include the selected draft type in the URL so prechoice uses it
    navigate(
      `/draft/prechoice?mapSlices=${encoded}&draftType=${selectedDraftType}`,
    );
  };

  const handleDraftTypeSelect = (draftType: DraftType) => {
    closeDraftType();
    navigateToDraft(draftType);
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

      // Sidebar tiles can drop on OPEN, SYSTEM, or HOME tiles
      if (
        destTile.type !== "OPEN" &&
        destTile.type !== "SYSTEM" &&
        destTile.type !== "HOME"
      )
        return;
      if (destTile.type === "SYSTEM" && destTile.systemId === "18") return;

      addSystemToMap(destTile.idx, systemId);
      return;
    }

    // Tile-to-tile swap (map tiles only)
    if (!originTile || !destTile) return;

    // Protect Mecatol Rex (index 0)
    if (originTile.idx === 0 || destTile.idx === 0) return;

    // Only allow swapping draggable types (SYSTEM, HOME) with valid drop targets (SYSTEM, HOME, OPEN)
    const draggableTypes = ["SYSTEM", "HOME"];
    const droppableTypes = ["SYSTEM", "HOME", "OPEN"];

    if (!draggableTypes.includes(originTile.type)) return;
    if (!droppableTypes.includes(destTile.type)) return;

    // Don't allow dropping on Mecatol Rex
    if (destTile.type === "SYSTEM" && destTile.systemId === "18") return;

    // Use swapTiles for all tile-to-tile swaps
    swapTiles(originTile.idx, destTile.idx);
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
      <DraftTypeSelectionModal
        opened={draftTypeOpened}
        compatibleTypes={compatibleDraftTypes}
        onClose={closeDraftType}
        onSelect={handleDraftTypeSelect}
      />

      <MapBuilderPlanetFinder />
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
                  <MultiSelect
                    data={[
                      { value: "base", label: "Base" },
                      { value: "pok", label: "PoK" },
                      { value: "te", label: "Thunder's Edge" },
                      { value: "unchartedstars", label: "Uncharted Stars" },
                    ]}
                    value={gameSets}
                    onChange={(value) => setGameSets(value as GameSet[])}
                    placeholder="Game Sets"
                    size="xs"
                    w={180}
                    checkIconPosition="right"
                    clearable
                    maxValues={4}
                    styles={{
                      input: {
                        backgroundColor: "var(--mantine-color-dark-6)",
                        borderColor: "var(--mantine-color-dark-4)",
                        color: "var(--mantine-color-gray-0)",
                        overflow: "hidden",
                      },
                      pill: {
                        display: "none",
                      },
                    }}
                  />
                  <Group gap={4}>
                    <ActionIcon
                      variant="filled"
                      color="dark"
                      size="sm"
                      onClick={() => setRingCount(ringCount - 1)}
                      disabled={ringCount <= 2}
                    >
                      <IconMinus size={14} />
                    </ActionIcon>
                    <Text size="xs" c="gray.0" w={55} ta="center">
                      {ringCount} rings
                    </Text>
                    <ActionIcon
                      variant="filled"
                      color="dark"
                      size="sm"
                      onClick={() => setRingCount(ringCount + 1)}
                      disabled={ringCount >= 5}
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                  </Group>
                  <ActionIcon
                    variant={closeTileMode ? "filled" : "default"}
                    color={closeTileMode ? "red" : "dark"}
                    size="lg"
                    onClick={toggleCloseTileMode}
                    aria-label="Close tile tool"
                    title="Close tile tool"
                  >
                    <IconHexagonOff size={18} />
                  </ActionIcon>
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
                  <Button
                    leftSection={<IconPhoto size={16} />}
                    variant="filled"
                    color="purple"
                    onClick={() => window.open(imageUrl, "_blank")}
                    size="xs"
                    disabled={!isMapComplete}
                  >
                    Share Image
                  </Button>
                  <Button
                    leftSection={<IconWand size={16} />}
                    variant="filled"
                    color="teal"
                    onClick={handleCreateDraft}
                    size="xs"
                    disabled={!isMapComplete}
                  >
                    Create Draft
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
                sliceValues={sliceValues}
                sliceStats={sliceStats}
                sliceBreakdowns={sliceBreakdowns}
                tileContributions={tileContributions}
                hoveredHomeIdx={hoveredHomeIdx}
                onHomeHover={setHoveredHomeIdx}
                closeTileMode={closeTileMode}
                closedTiles={closedTiles}
                onToggleTileClosed={toggleTileClosed}
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
