import {
  Button,
  Modal,
  MultiSelect,
  Notice,
  NumberStepper,
  Select,
  TextInput,
  Textarea,
  Text,
  cx,
  notify,
  useDisclosure,
} from "~/ui";
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
  IconHexagonOff,
  IconFileExport,
  IconInfoCircle,
  IconCircleCheck,
  IconUpload,
  IconLayoutGrid,
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
import { calculateMapStats } from "~/utils/mapStats";
import { encodeMapString, decodeMapString } from "../utils/mapStringCodec";
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
import { mapGeneratorHref } from "~/utils/presetMapClient";
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
import classes from "./MapGenerator.module.css";

/** Game sets for the top bar; the trigger shows the short name, the list the full one. */
const GAME_SET_OPTIONS: { value: GameSet; label: React.ReactNode }[] = [
  { value: "base", label: "Base", short: "B" },
  { value: "pok", label: "PoK", short: "PoK" },
  { value: "te", label: "Thunder's Edge", short: "TE" },
  { value: "unchartedstars", label: "Uncharted Stars", short: "US" },
].map(({ value, label, short }) => ({
  value: value as GameSet,
  label: (
    <>
      <span className={classes.setLong}>{label}</span>
      <span className={classes.setShort} title={label}>
        {short}
      </span>
    </>
  ),
}));

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
  const stats = useMemo(() => calculateMapStats([], map), [map]);

  const playerCount = map.filter((tile) => tile.type === "HOME").length;

  const sliceValues = useMemo(() => getAllSliceValues(map), [map]);
  const sliceStats = useMemo(() => getAllSliceStats(map), [map]);
  const sliceBreakdowns = useMemo(() => getAllSliceBreakdowns(map), [map]);
  const tileContributions = useMemo(() => getAllTileContributions(map), [map]);
  const balanceGap = calculateBalanceGap(sliceValues);

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
  const compatibleDraftTypes = mapConfigToCompatibleDraftTypes[mapConfigId];
  const [publishName, setPublishName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishAuthor, setPublishAuthor] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishTried, setPublishTried] = useState(false);
  const mapString = useMemo(() => encodeMapString(map), [map]);

  const externalMapStrings = useMemo(
    () => ({
      ttpg: encodeTtpgMapString(map),
      async: encodeAsyncMapString(map),
    }),
    [map],
  );

  const hasSystems = map.some(
    (tile) => tile.type === "SYSTEM" && tile.idx !== 0,
  );

  const shareUrl = mapGeneratorHref(mapString, "https://tidraft.com");
  const imageUrl = `https://tidraft.com/map-generator.png?map=${encodeURIComponent(mapString)}`;

  const openHexCount = map.filter((tile) => tile.type === "OPEN").length;
  const isMapComplete = openHexCount === 0;

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
    notify({
      title: "Randomization failed",
      message: "Try different parameters. Using random placement as fallback.",
      tone: "warning",
    });

    const shuffledSystems = shuffle(systemPool);
    let systemIdx = 0;
    const randomMap: Tile[] = clearedMap.map((tile, idx) => {
      if (
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
      notify({
        title: "Invalid input",
        message: `Please enter a ${formatLabel} map string`,
        tone: "danger",
      });
      return false;
    }

    const decoded =
      format === "ttpg"
        ? decodeTtpgMapString(mapString)
        : decodeAsyncMapString(mapString);
    if (!decoded) {
      notify({
        title: "Invalid input",
        message: `This is not a valid ${formatLabel} map string`,
        tone: "danger",
      });
      return false;
    }

    loadDecodedMap(decoded.map, decoded.ringCount, decoded.gameSets);

    const systemsPlaced = decoded.map.filter(
      (tile) => tile.type === "SYSTEM" && tile.idx !== 0,
    ).length;

    notify({
      title: "Map imported",
      message: `Imported ${systemsPlaced} systems from ${formatLabel}`,
      tone: "success",
    });
    return true;
  };

  const handleCreateDraft = () => {
    if (!compatibleDraftTypes || compatibleDraftTypes.length === 0) {
      notify({
        title: "Unsupported",
        message: "This map type doesn't support draft creation",
        tone: "danger",
      });
      return;
    }

    if (compatibleDraftTypes.length > 1) {
      openDraftType();
      return;
    }

    navigateToDraft(compatibleDraftTypes[0]);
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
      notify({
        title: isMissingPlayers ? "Missing players" : "Unsupported",
        message: result.error,
        tone: isMissingPlayers ? "warning" : "danger",
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
      compatibleDraftTypes,
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

  const closePublishModal = () => {
    setPublishTried(false);
    closePublish();
  };

  const handlePublish = async () => {
    if (!isMapComplete) {
      notify({
        title: "Map incomplete",
        message: "Complete the map before publishing.",
        tone: "warning",
      });
      return;
    }

    const name = publishName.trim();
    const description = publishDescription.trim();
    const author = publishAuthor.trim();

    if (!name || !description || !author) {
      notify({
        title: "Missing details",
        message: "Name, description, and author are required.",
        tone: "danger",
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
        notify({
          title: "Publish failed",
          message: result?.error ?? "Unable to publish map.",
          tone: "danger",
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
  const [activeSystemRotation, setActiveSystemRotation] = useState<
    number | undefined
  >(undefined);

  // Seed the builder store from a shared `?map=` link once on mount.
  useEffect(() => {
    const mapParam = new URLSearchParams(window.location.search).get("map");
    const decoded = mapParam ? decodeMapString(mapParam) : null;
    if (decoded) {
      loadDecodedMap(decoded.map, decoded.ringCount, decoded.gameSets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const publishMissing =
    publishTried &&
    (!publishName.trim() ||
      !publishDescription.trim() ||
      !publishAuthor.trim());
  // Where the gap sits between "even" and "uneven"; 10 points or more reads as fully uneven.
  const gapPosition = Math.min(balanceGap / 10, 1) * 100;

  const shipReason = !isMapComplete
    ? `${openHexCount} open ${openHexCount === 1 ? "hex" : "hexes"} left. Fill ${openHexCount === 1 ? "it" : "them"} to make an image, start a draft or publish.`
    : "Map complete. Start a draft from it or publish it to Community maps.";

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
        compatibleTypes={compatibleDraftTypes ?? []}
        onClose={closeDraftType}
        onSelect={handleDraftTypeSelect}
      />
      <Modal
        opened={publishOpened}
        onClose={closePublishModal}
        title="Publish map"
        size="lg"
        footer={
          <>
            <Button variant="tertiary" onClick={closePublishModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setPublishTried(true);
                handlePublish();
              }}
              loading={publishing}
              disabled={!isMapComplete}
            >
              Publish map
            </Button>
          </>
        }
      >
        <div className={classes.publishRow}>
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
        </div>
        <Textarea
          label="Description"
          placeholder="What makes this map special?"
          rows={4}
          value={publishDescription}
          onChange={(e) => setPublishDescription(e.currentTarget.value)}
          error={
            publishMissing
              ? "Name, description and author are required."
              : undefined
          }
        />
        <Text size="sm" tone="muted">
          Published maps appear in Community maps and open at their own page.
        </Text>
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
          <div className={classes.dupNotice}>
            <Notice tone="warning" title="Duplicate hyperlanes">
              Physical maps may be limited to one copy of each hyperlane tile.
            </Notice>
          </div>
        )}
        <div className={cx(classes.gen, closeTileMode && classes.closing)}>
          <aside className={classes.side} aria-label="Tiles">
            <TileSidebar />
          </aside>
          <div className={classes.main}>
            <div className={classes.bar}>
              <div className={classes.grp}>
                <Select
                  aria-label="Map type"
                  size="sm"
                  width={150}
                  options={Object.values(mapConfigs).map((config) => ({
                    value: config.id,
                    label: config.name,
                  }))}
                  value={mapConfigId}
                  onChange={(value) => {
                    if (value && mapConfigs[value]) {
                      setMapConfig(value);
                    }
                  }}
                />
                <div className={classes.sets}>
                  <MultiSelect
                    aria-label="Game sets"
                    size="sm"
                    placeholder="Game sets"
                    options={GAME_SET_OPTIONS}
                    value={gameSets}
                    onChange={(value) => setGameSets(value as GameSet[])}
                  />
                </div>
              </div>
              <div className={classes.grp}>
                <NumberStepper
                  size="sm"
                  label="rings"
                  display={
                    <>
                      <b>{ringCount}</b> rings
                    </>
                  }
                  decrease={() => setRingCount(ringCount - 1)}
                  increase={() => setRingCount(ringCount + 1)}
                  decreaseDisabled={ringCount <= 2}
                  increaseDisabled={ringCount >= 5}
                />
                <NumberStepper
                  size="sm"
                  label="players"
                  display={
                    <>
                      <b>{playerCount}</b> players
                    </>
                  }
                  decrease={removeHomeSystem}
                  increase={addHomeSystem}
                  decreaseDisabled={playerCount <= 1}
                />
              </div>
              <div className={cx(classes.grp, classes.grpEnd)}>
                <div
                  className={classes.joined}
                  role="group"
                  aria-label="Export"
                >
                  <button type="button" onClick={openMapStrings}>
                    <IconFileExport />
                    Map strings
                  </button>
                  <button type="button" onClick={openShare}>
                    <IconShare />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(imageUrl, "_blank")}
                    disabled={!isMapComplete}
                    title={
                      isMapComplete
                        ? undefined
                        : "Fill every open hex to make an image"
                    }
                  >
                    <IconPhoto />
                    Image
                  </button>
                </div>
              </div>
            </div>

            <div className={classes.canvas}>
              <MapStatsOverlay stats={stats} className={classes.stats} />

              <div
                className={classes.dock}
                role="toolbar"
                aria-label="Map tools"
              >
                <button
                  type="button"
                  className={classes.tool}
                  onClick={handleRandomize}
                >
                  <IconRefresh />
                  <span>
                    Randomize
                    <small>Refill every open system</small>
                  </span>
                </button>
                <div className={classes.balance}>
                  <button
                    type="button"
                    className={classes.tool}
                    onClick={handleImproveBalance}
                    disabled={balanceGap === 0}
                  >
                    <IconArrowsShuffle />
                    <span>
                      Balance
                      <small>One improving swap per press</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={classes.gapMeter}
                    onClick={openInfo}
                    aria-label={`Balance gap ${balanceGap.toFixed(1)}. How slice scoring works`}
                  >
                    <span className={classes.gapRow}>
                      Gap <b>{balanceGap.toFixed(1)}</b>
                      <IconInfoCircle />
                    </span>
                    <span className={classes.gapBar}>
                      <i style={{ left: `${gapPosition}%` }} />
                    </span>
                    <span className={classes.gapScale}>
                      <span>Even</span>
                      <span>Uneven</span>
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  className={cx(classes.tool, closeTileMode && classes.toolOn)}
                  aria-pressed={closeTileMode}
                  onClick={toggleCloseTileMode}
                >
                  <IconHexagonOff />
                  <span>
                    Close hexes
                    <small>
                      {closeTileMode
                        ? "On: click a hex to close or reopen it"
                        : "Mark hexes as off the map"}
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  className={cx(classes.tool, classes.toolReset)}
                  onClick={clearMap}
                >
                  <IconTrash />
                  <span>Reset map</span>
                </button>
              </div>

              <div className={classes.mapBox}>
                <Map
                  id="map-generator"
                  modifiableMapTiles={modifiableMapTiles}
                  map={map}
                  disabled={false}
                  interactions={MAP_INTERACTIONS.mapGenerator}
                  onSelectSystemTile={(tile) =>
                    openPlanetFinderForMap(tile.idx)
                  }
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
              </div>

              <div className={classes.ship}>
                <p className={classes.why}>
                  {isMapComplete ? <IconCircleCheck /> : <IconInfoCircle />}
                  {shipReason}
                </p>
                <div className={classes.shipButtons}>
                  <Button
                    icon={<IconLayoutGrid size={16} />}
                    onClick={handleCreateDraft}
                    disabled={!isMapComplete}
                  >
                    Slice draft
                  </Button>
                  <Button
                    icon={<IconWand size={16} />}
                    onClick={handleCreatePresetDraft}
                    disabled={!isMapComplete}
                  >
                    Preset draft
                  </Button>
                  <Button
                    variant="primary"
                    icon={<IconUpload size={16} />}
                    onClick={openPublish}
                    disabled={!isMapComplete}
                  >
                    Publish map
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <MainAppShell flush>
      <ClientOnly fallback={<div className={classes.fallback} />}>
        {() => <MapGeneratorContent />}
      </ClientOnly>
    </MainAppShell>
  );
}
