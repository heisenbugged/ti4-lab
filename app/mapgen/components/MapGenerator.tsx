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
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { MainAppShell } from "~/components/MainAppShell";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { useState, useMemo, useEffect } from "react";
import { Tile, GameSet, SystemId, DraftSettings } from "~/types";
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
  IconShare,
  IconPhoto,
  IconWand,
  IconMinus,
  IconPlus,
  IconHexagonOff,
  IconFileExport,
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
import { encodeMapString, decodeMapString, inferGameSetsFromTiles } from "../utils/mapStringCodec";
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
import { TtsImportExportModal } from "./TtsImportExportModal";
import { DraftType } from "~/draft/types";

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
    addHomeSystem,
    removeHomeSystem,
    loadDecodedMap,
  } = useMapBuilder((state) => state.actions);
  const stats = useMapStats();

  // Calculate player count from HOME tiles
  const playerCount = useMemo(
    () => map.filter((tile) => tile.type === "HOME").length,
    [map],
  );

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
  const [ttsOpened, { open: openTts, close: closeTts }] =
    useDisclosure(false);
  const [compatibleDraftTypes, setCompatibleDraftTypes] = useState<DraftType[]>(
    [],
  );
  const mapString = useMemo(() => {
    return encodeMapString(map);
  }, [map]);

  // TTS string for import/export (space-separated system IDs)
  const ttsMapString = useMemo(() => {
    return map
      .slice(1)
      .map((tile) => {
        if (tile.type === "HOME") return "0";
        if (tile.type === "SYSTEM") return tile.systemId;
        return "-1";
      })
      .join(" ");
  }, [map]);

  const hasSystems = useMemo(() => {
    return map.some((tile) => tile.type === "SYSTEM" && tile.idx !== 0);
  }, [map]);

  const shareUrl = useMemo(() => {
    const encoded = encodeMapString(map);
    return `https://tidraft.com/map-generator?map=${encodeURIComponent(encoded)}`;
  }, [map]);

  const imageUrl = useMemo(() => {
    const encoded = encodeMapString(map);
    return `https://tidraft.com/map-generator.png?map=${encodeURIComponent(encoded)}`;
  }, [map]);

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

  const handleImportTtsString = (ttsString: string) => {
    if (!ttsString.trim()) {
      notifications.show({
        title: "Invalid input",
        message: "Please enter a TTS string",
        color: "red",
      });
      return;
    }

    const systemIds = ttsString
      .trim()
      .split(/\s+/)
      .filter(Boolean) as SystemId[];

    if (systemIds.length === 0) {
      notifications.show({
        title: "Invalid input",
        message: "TTS string contains no system IDs",
        color: "red",
      });
      return;
    }

    const config = mapConfigs[mapConfigId];
    const presetTileIndices = new Set(
      Object.keys(config.presetTiles).map(Number),
    );

    clearMap();

    const clearedMap = useMapBuilder.getState().state.map;
    const actualSystemIds = systemIds.filter((id) => id !== "0" && id !== "-1");
    const placeableCount = clearedMap.filter(
      (tile, idx) =>
        idx !== 0 &&
        tile.type === "OPEN" &&
        !config.homeIdxInMapString.includes(idx) &&
        !config.closedMapTiles.includes(idx) &&
        !presetTileIndices.has(idx),
    ).length;

    if (actualSystemIds.length > placeableCount) {
      notifications.show({
        title: "Too many systems",
        message: `TTS string contains ${actualSystemIds.length} systems, but only ${placeableCount} placeable positions available`,
        color: "yellow",
      });
    }

    const inferredSets = inferGameSetsFromTiles(systemIds);
    setGameSets(inferredSets);

    systemIds.forEach((systemId, ttsPosition) => {
      const mapIdx = ttsPosition + 1;

      if (mapIdx >= clearedMap.length) {
        return;
      }

      if (systemId === "0" || systemId === "-1") {
        return;
      }

      if (
        mapIdx === 0 ||
        config.homeIdxInMapString.includes(mapIdx) ||
        config.closedMapTiles.includes(mapIdx) ||
        presetTileIndices.has(mapIdx)
      ) {
        return;
      }

      if (systemData[systemId]) {
        addSystemToMap(mapIdx, systemId);
      } else {
        notifications.show({
          title: "Invalid system ID",
          message: `System ID "${systemId}" not found`,
          color: "yellow",
        });
      }
    });

    const systemsPlaced = systemIds.filter(
      (id) => id !== "0" && id !== "-1" && systemData[id],
    ).length;

    notifications.show({
      title: "Map imported",
      message: `Imported ${systemsPlaced} systems from TTS string`,
      color: "green",
    });
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

  const handleCreatePresetDraft = () => {
    const compatibleTypes = mapConfigToCompatibleDraftTypes[mapConfigId];
    if (!compatibleTypes || compatibleTypes.length === 0) {
      notifications.show({
        title: "Unsupported",
        message: "This map type doesn't support draft creation",
        color: "red",
      });
      return;
    }

    const selectedDraftType = compatibleTypes[0];
    if (!selectedDraftType) {
      notifications.show({
        title: "Unsupported",
        message: "This map type doesn't support draft creation",
        color: "red",
      });
      return;
    }

    if (playerCount <= 0) {
      notifications.show({
        title: "Missing players",
        message: "Add home systems before starting a draft",
        color: "yellow",
      });
      return;
    }
    const presetSettings: DraftSettings = {
      type: selectedDraftType,
      factionGameSets: gameSets,
      tileGameSets: gameSets,
      draftSpeaker: true,
      allowHomePlanetSearch: false,
      numFactions: Math.max(6, playerCount),
      numSlices: playerCount,
      randomizeMap: false,
      randomizeSlices: false,
      draftPlayerColors: false,
      allowEmptyTiles: false,
      draftGameMode: "presetMap",
      presetMap: map,
    };

    navigate("/draft/new", {
      state: {
        draftSettings: presetSettings,
        players: Array(playerCount)
          .fill(null)
          .map((_, i) => ({ id: i, name: "" })),
        discordData: undefined,
      },
    });
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
    const mapParam = params.get("map");

    if (mapParam) {
      // New format: single `map` parameter with complete map encoding
      const decoded = decodeMapString(mapParam);
      if (decoded) {
        loadDecodedMap(decoded.map, decoded.ringCount, decoded.gameSets, decoded.closedTiles);
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
      <TtsImportExportModal
        ttsExportString={hasSystems ? ttsMapString : ""}
        opened={ttsOpened}
        onClose={closeTts}
        onImport={handleImportTtsString}
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
            breakpoint: "md",
            collapsed: { mobile: true },
          }}
          padding={0}
        >
          <AppShell.Navbar p={0} visibleFrom="sm">
            <TileSidebar />
          </AppShell.Navbar>
          <AppShell.Main p={0} h="calc(100vh - 60px)" mih="calc(100vh - 60px)">
            <Box bg="dark.7" px="sm" py={8}>
              <Group gap="sm" wrap="wrap">
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
                  w={140}
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
                  w={160}
                  checkIconPosition="right"
                  styles={{ pill: { display: "none" } }}
                />
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setRingCount(ringCount - 1)} disabled={ringCount <= 2}>
                    <IconMinus size={14} />
                  </ActionIcon>
                  <Text size="xs" c="dimmed" w={50} ta="center">{ringCount} rings</Text>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setRingCount(ringCount + 1)} disabled={ringCount >= 5}>
                    <IconPlus size={14} />
                  </ActionIcon>
                </Group>
                <Button
                  leftSection={<IconFileExport size={14} />}
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={openTts}
                >
                  Import/Export
                </Button>
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={removeHomeSystem} disabled={playerCount <= 1}>
                    <IconMinus size={14} />
                  </ActionIcon>
                  <Text size="xs" c="dimmed" w={55} ta="center">{playerCount} players</Text>
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={addHomeSystem}>
                    <IconPlus size={14} />
                  </ActionIcon>
                </Group>
                <ActionIcon
                  variant={closeTileMode ? "filled" : "subtle"}
                  color={closeTileMode ? "red" : "gray"}
                  size="sm"
                  onClick={toggleCloseTileMode}
                  title="Close tile tool"
                >
                  <IconHexagonOff size={16} />
                </ActionIcon>
                <Button leftSection={<IconRefresh size={14} />} variant="subtle" color="gray" size="xs" onClick={handleRandomize}>
                  Randomize
                </Button>
                <Button leftSection={<IconArrowsShuffle size={14} />} variant="subtle" color="gray" size="xs" onClick={handleImproveBalance} disabled={balanceGap === 0}>
                  Balance
                </Button>
                <Button leftSection={<IconTrash size={14} />} variant="subtle" color="gray" size="xs" onClick={clearMap}>
                  Reset
                </Button>
                {balanceGap > 0 && (
                  <Group gap={4} onClick={openInfo} style={{ cursor: "pointer" }}>
                    <Text size="xs" c="dimmed">Gap:</Text>
                    <Text size="xs" fw={600} c="yellow.5">{balanceGap.toFixed(1)}</Text>
                  </Group>
                )}
                <Box style={{ marginLeft: "auto" }}>
                  <Group gap="xs">
                    <Button leftSection={<IconShare size={14} />} variant="subtle" color="gray" size="xs" onClick={openShare}>
                      Share
                    </Button>
                    <Button leftSection={<IconPhoto size={14} />} variant="subtle" color="gray" size="xs" onClick={() => window.open(imageUrl, "_blank")} disabled={!isMapComplete}>
                      Image
                    </Button>
                    <Button variant="light" color="blue" size="xs" onClick={handleCreateDraft} disabled={!isMapComplete}>
                      Slice Draft
                    </Button>
                    <Button leftSection={<IconWand size={14} />} variant="filled" color="blue" size="xs" onClick={handleCreatePresetDraft} disabled={!isMapComplete}>
                      Preset Draft
                    </Button>
                  </Group>
                </Box>
              </Group>
            </Box>
            <Box
              w="100%"
              pos="relative"
              p="md"
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
                disabled={false}
                interactions={MAP_INTERACTIONS.mapGenerator}
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
