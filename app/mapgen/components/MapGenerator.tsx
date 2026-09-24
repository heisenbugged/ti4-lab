import {
  AppShell,
  Box,
  Button,
  Group,
  Text,
  Modal,
  ActionIcon,
  Select,
  MultiSelect,
  TextInput,
  Textarea,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ClientOnly } from "remix-utils/client-only";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { MainAppShell } from "~/components/MainAppShell";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { useState, useMemo, useEffect } from "react";
import { Tile, GameSet } from "~/types";
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
import { shuffle } from "~/draft/helpers/randomization";
import { useMapStats } from "../utils/mapStats";
import {
  encodeMapString,
  decodeMapString,
} from "../utils/mapStringCodec";
import {
  encodeAsyncMapString,
  decodeAsyncMapString,
  encodeTtpgMapString,
  decodeTtpgMapString,
  type ExternalMapStringFormat,
} from "../utils/externalMapStringCodec";
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
import { MapStringImportExportModal } from "./MapStringImportExportModal";
import { DraftType } from "~/draft/types";
import { buildPresetDraftState } from "../utils/presetDraft";

function MapGeneratorContent() {
  const navigate = useNavigate();
  const map = useMapBuilder((state) => state.state.map);
  const systemPool = useMapBuilder((state) => state.state.systemPool);
  const mapConfigId = useMapBuilder((state) => state.state.mapConfigId);
  const gameSets = useMapBuilder((state) => state.state.gameSets);
  const ringCount = useMapBuilder((state) => state.state.ringCount);
  const hoveredHomeIdx = useMapBuilder((state) => state.state.hoveredHomeIdx);
  const closeTileMode = useMapBuilder((state) => state.state.closeTileMode);
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

  const duplicateHyperlanes = useMemo(() => {
    const counts = new globalThis.Map<string, number>();
    map.forEach((tile) => {
      if (tile.type !== "SYSTEM") return;
      const system = systemData[tile.systemId];
      if (system?.type !== "HYPERLANE") return;
      counts.set(tile.systemId, (counts.get(tile.systemId) ?? 0) + 1);
    });
    return Array.from(counts.entries()).filter(([, count]) => count > 1);
  }, [map]);

  const [infoOpened, { open: openInfo, close: closeInfo }] =
    useDisclosure(false);
  const [shareOpened, { open: openShare, close: closeShare }] =
    useDisclosure(false);
  const [draftTypeOpened, { open: openDraftType, close: closeDraftType }] =
    useDisclosure(false);
  const [mapStringsOpened, { open: openMapStrings, close: closeMapStrings }] =
    useDisclosure(false);
  const [publishOpened, { open: openPublish, close: closePublish }] =
    useDisclosure(false);
  const [compatibleDraftTypes, setCompatibleDraftTypes] = useState<DraftType[]>(
    [],
  );
  const [publishName, setPublishName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishAuthor, setPublishAuthor] = useState("");
  const [publishing, setPublishing] = useState(false);
  const mapString = useMemo(() => {
    return encodeMapString(map);
  }, [map]);

  const externalMapStrings = useMemo(
    () => ({
      ttpg: encodeTtpgMapString(map),
      async: encodeAsyncMapString(map),
    }),
    [map],
  );

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

  // Check if map is complete (no OPEN tiles)
  const isMapComplete = useMemo(() => {
    return !map.some((tile) => tile.type === "OPEN");
  }, [map]);

  // Make all tiles except Mecatol Rex and closed tiles modifiable.
  const modifiableMapTiles = Array.from(
    { length: map.length },
    (_, i) => i,
  ).filter((i) => i !== 0 && map[i]?.type !== "CLOSED");

  const handleRandomize = () => {
    const currentMap = useMapBuilder.getState().state.map;

    // Preserve Mecatol Rex, home systems and hyperlanes
    const preserveIndices = new Set<number>([0]);
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

    const clearedMap: Tile[] = currentMap.map((tile, idx) =>
      tile.type === "SYSTEM" && !preserveIndices.has(idx)
        ? { idx: tile.idx, position: tile.position, type: "OPEN" }
        : tile,
    );

    const completedMap = autoCompleteMap(clearedMap, systemPool);
    if (completedMap) {
      setMap(completedMap);
      return;
    }

    // Fallback to random placement if auto-complete fails
    notifications.show({
      title: "Randomization failed",
      message: "Try different parameters. Using random placement as fallback.",
      color: "yellow",
    });

    const shuffledSystems = shuffle(systemPool);
    let systemIdx = 0;
    const randomMap: Tile[] = clearedMap.map((tile, idx) => {
      if (
        idx === 0 ||
        tile.type === "CLOSED" ||
        preserveIndices.has(idx) ||
        systemIdx >= shuffledSystems.length
      ) {
        return tile;
      }
      return {
        idx: tile.idx,
        position: tile.position,
        type: "SYSTEM",
        systemId: shuffledSystems[systemIdx++],
      };
    });
    setMap(randomMap);
  };

  const handleImproveBalance = () => {
    const improvedMap = improveBalance(map);
    if (improvedMap) {
      setMap(improvedMap);
    }
  };

  const handleImportMapString = (
    mapString: string,
    format: ExternalMapStringFormat,
  ): boolean => {
    const formatLabel = format === "ttpg" ? "TTPG" : "Async";
    if (!mapString.trim()) {
      notifications.show({
        title: "Invalid input",
        message: `Please enter a ${formatLabel} map string`,
        color: "red",
      });
      return false;
    }

    const decoded =
      format === "ttpg"
        ? decodeTtpgMapString(mapString)
        : decodeAsyncMapString(mapString);
    if (!decoded) {
      notifications.show({
        title: "Invalid input",
        message: `This is not a valid ${formatLabel} map string`,
        color: "red",
      });
      return false;
    }

    loadDecodedMap(decoded.map, decoded.ringCount, decoded.gameSets);

    const systemsPlaced = decoded.map.filter(
      (tile) => tile.type === "SYSTEM" && tile.idx !== 0,
    ).length;

    notifications.show({
      title: "Map imported",
      message: `Imported ${systemsPlaced} systems from ${formatLabel}`,
      color: "green",
    });
    return true;
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
    const result = buildPresetDraftState({
      map,
      mapConfigId,
      gameSets,
      playerCount,
    });

    if (!result.ok) {
      const isMissingPlayers = result.error.includes("home systems");
      notifications.show({
        title: isMissingPlayers ? "Missing players" : "Unsupported",
        message: result.error,
        color: isMissingPlayers ? "yellow" : "red",
      });
      return;
    }

    navigate("/draft/new", {
      state: {
        draftSettings: result.value.settings,
        players: result.value.players,
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

  const handlePublish = async () => {
    if (!isMapComplete) {
      notifications.show({
        title: "Map incomplete",
        message: "Complete the map before publishing.",
        color: "yellow",
      });
      return;
    }

    const name = publishName.trim();
    const description = publishDescription.trim();
    const author = publishAuthor.trim();

    if (!name || !description || !author) {
      notifications.show({
        title: "Missing details",
        message: "Name, description, and author are required.",
        color: "red",
      });
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch("/api/preset-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          author,
          mapString,
          mapConfigId,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success || !result?.slug) {
        notifications.show({
          title: "Publish failed",
          message: result?.error ?? "Unable to publish map.",
          color: "red",
        });
        return;
      }

      // Navigate to the published map page
      navigate(`/maps/${result.slug}`);
    } finally {
      setPublishing(false);
    }
  };

  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  const [activeSystemRotation, setActiveSystemRotation] = useState<number | undefined>(
    undefined,
  );

  // Parse URL parameters and seed map on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mapParam = params.get("map");

    if (mapParam) {
      // New format: single `map` parameter with complete map encoding
      const decoded = decodeMapString(mapParam);
      if (decoded) {
        loadDecodedMap(decoded.map, decoded.ringCount, decoded.gameSets);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      const rotation = event.active.data.current?.rotation;
      setActiveSystemId(systemId || null);
      setActiveSystemRotation(rotation);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSystemId(null);
    setActiveSystemRotation(undefined);

    if (!event.over) return;

    const activeId = event.active.id as string;
    const originTile: Tile | undefined = event.active.data.current?.tile;
    const destTile: Tile | undefined = event.over.data.current?.tile;

    // Sidebar to map drag
    if (activeId.startsWith("sidebar-")) {
      const systemId = event.active.data.current?.systemId;
      const rotation = event.active.data.current?.rotation;
      if (!systemId || !destTile) return;

      // Sidebar tiles can drop on OPEN, SYSTEM, or HOME tiles
      if (
        destTile.type !== "OPEN" &&
        destTile.type !== "SYSTEM" &&
        destTile.type !== "HOME"
      )
        return;
      if (destTile.type === "SYSTEM" && destTile.systemId === "18") return;

      addSystemToMap(destTile.idx, systemId, rotation);
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
      <Modal
        opened={publishOpened}
        onClose={closePublish}
        title="Publish Map"
        centered
      >
        <Group gap="sm" mb="md" grow>
          <TextInput
            label="Name"
            placeholder="Map name"
            value={publishName}
            onChange={(e) => setPublishName(e.currentTarget.value)}
          />
          <TextInput
            label="Author"
            placeholder="Your name"
            value={publishAuthor}
            onChange={(e) => setPublishAuthor(e.currentTarget.value)}
          />
        </Group>
        <Textarea
          label="Description"
          placeholder="What makes this map special?"
          minRows={4}
          value={publishDescription}
          onChange={(e) => setPublishDescription(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={closePublish}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            loading={publishing}
            disabled={!isMapComplete}
          >
            Publish
          </Button>
        </Group>
      </Modal>
      <MapStringImportExportModal
        exportStrings={
          hasSystems ? externalMapStrings : { ttpg: "", async: "" }
        }
        opened={mapStringsOpened}
        onClose={closeMapStrings}
        onImport={handleImportMapString}
      />

      <MapBuilderPlanetFinder />
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        {duplicateHyperlanes.length > 0 && (
          <Box
            pos="fixed"
            bottom={12}
            right={12}
            style={{ zIndex: 2000, maxWidth: 320 }}
          >
            <Alert color="yellow" variant="light" radius="md">
              <Text size="xs">
                Duplicate hyperlanes detected. Physical maps may be limited to one copy per tile.
              </Text>
            </Alert>
          </Box>
        )}
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
                  onClick={openMapStrings}
                >
                  Map Strings
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
                    <Button variant="light" color="teal" size="xs" onClick={openPublish} disabled={!isMapComplete}>
                      Publish
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
                rotation: activeSystemRotation,
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
