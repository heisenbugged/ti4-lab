import { useMemo, useState } from "react";
import { IconArrowBackUp } from "@tabler/icons-react";
import {
  Button,
  Chip,
  Modal,
  PlayerHex,
  PlayerTag,
  Tag,
  Text,
  Tooltip,
  playerVar,
  useMediaQuery,
} from "~/ui";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { RollingDraftOrder } from "../components/RollingDraftOrder";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import {
  getCurrentPlaceableRing,
  getPlaceableTileIndices,
} from "~/utils/texasMapBuild";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { systemData } from "~/data/systemData";
import { playerColors } from "~/data/factionData";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { useAdminControls } from "../components/useAdminControls";
import { PhaseBanner } from "../components/SimultaneousPhaseHeader";
import { TexasTile } from "./TexasTileDraftPhase";
import classes from "./TexasMapBuildPhase.module.css";

const ringNames = {
  1: "First ring",
  2: "Second ring",
  3: "Third ring",
  4: "Fourth ring",
} as const;

export function TexasMapBuildPhase() {
  const draft = useDraft((state) => state.draft);
  const { placeTexasTile } = useDraft((state) => state.draftActions);
  const { syncDraft, undoLastPick } = useSyncDraft();
  const {
    hydratedPlayers,
    hydratedMap,
    currentPick,
    activePlayer,
    currentlyPicking,
  } = useHydratedDraft();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const {
    adminMode,
    pickForAnyone,
    setPickForAnyone,
    showPickForAnyoneControl,
    showUndoLastSelection,
    passwordModalOpen,
    setPasswordModalOpen,
    handleAdminPasswordSubmit,
    handleAdminToggle,
  } = useAdminControls();
  const selections = useDraft((state) => state.draft.selections);

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [pendingPlacement, setPendingPlacement] = useState<{
    tileIdx: number;
    systemId: string;
  } | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const playerTiles =
    activePlayer && draft.texasDraft?.playerTiles
      ? (draft.texasDraft.playerTiles[activePlayer.id] ?? [])
      : [];

  const mapForRender = hydratedMap ?? draft.presetMap;
  const currentRing = getCurrentPlaceableRing(mapForRender);
  const ringName = ringNames[currentRing as 1 | 2 | 3 | 4];

  // All tiles in the current ring (for subtle highlight)
  const currentRingTiles = useMemo(
    () => getPlaceableTileIndices(mapForRender, playerTiles),
    [mapForRender, playerTiles],
  );

  // Filtered placeable tiles based on selected system (for full highlight)
  const placeableTileIndices = useMemo(
    () =>
      getPlaceableTileIndices(
        mapForRender,
        playerTiles,
        selectedSystemId || undefined,
      ),
    [mapForRender, playerTiles, selectedSystemId],
  );

  const sortedPlayerTiles = [...playerTiles].sort((a, b) => {
    const aType = systemData[a]?.type;
    const bType = systemData[b]?.type;
    if (aType !== bType) {
      return aType === "BLUE" ? -1 : 1;
    }
    return parseInt(a) - parseInt(b);
  });

  const canSelect =
    pickForAnyone || (currentlyPicking && selectedPlayer !== undefined);

  const handleSelectTile = (systemId: string) => {
    if (!canSelect || !activePlayer) return;
    setSelectedSystemId((current) => (current === systemId ? null : systemId));
    setPendingPlacement(null);
  };

  const handleMapTileSelect = (tile: { type: string; idx: number }) => {
    if (!selectedSystemId || !activePlayer) return;
    if (!canSelect) return;
    if (tile.type !== "OPEN") return;
    if (!placeableTileIndices.includes(tile.idx)) return;

    setPendingPlacement({ tileIdx: tile.idx, systemId: selectedSystemId });
  };

  const confirmPlacement = () => {
    if (!pendingPlacement || !activePlayer) return;
    placeTexasTile(
      activePlayer.id,
      pendingPlacement.tileIdx,
      pendingPlacement.systemId,
    );
    syncDraft();
    setPendingPlacement(null);
    setSelectedSystemId(null);
  };

  const activeColor =
    activePlayer !== undefined ? playerColors[activePlayer.id] : undefined;
  const instruction = !canSelect
    ? "Waiting for this player to place a tile."
    : selectedSystemId
      ? `Place tile ${selectedSystemId} on a highlighted hex.`
      : "Select a tile, then a highlighted hex on the map.";

  const pickAnyChip = (
    <Chip
      pressed={pickForAnyone}
      onChange={() => setPickForAnyone(!pickForAnyone)}
    >
      Pick for any player
    </Chip>
  );

  return (
    <div className={classes.shell}>
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <aside className={classes.tray} aria-label="Available tiles">
        <div className={classes.trayHead}>
          {activePlayer ? (
            <PlayerTag
              color={activeColor}
              name={activePlayer.name}
              letter={String.fromCharCode(65 + activePlayer.id)}
            />
          ) : (
            <Text size="sm" weight={600}>
              Waiting
            </Text>
          )}
          <p className={classes.trayLabel}>
            Available tiles ({sortedPlayerTiles.length}/5)
          </p>
        </div>
        <div className={classes.trayList}>
          {sortedPlayerTiles.length === 0 && (
            <p className={classes.trayEmpty}>No tiles left to place.</p>
          )}
          {sortedPlayerTiles.map((systemId) => (
            <TexasTile
              key={systemId}
              systemId={systemId}
              radius={isMobile ? 42 : 56}
              selected={selectedSystemId === systemId}
              faceDown={!canSelect}
              faceDownColor={
                systemData[systemId]?.type === "RED" ? "red" : "blue"
              }
              onClick={canSelect ? () => handleSelectTile(systemId) : undefined}
              className={!canSelect ? classes.faded : undefined}
            />
          ))}
        </div>
      </aside>

      <main className={classes.main}>
        <div className={classes.top}>
          <PhaseBanner
            tint={playerVar(activeColor)}
            badge={
              activePlayer ? (
                <PlayerHex color={activeColor} size="lg">
                  {String.fromCharCode(65 + activePlayer.id)}
                </PlayerHex>
              ) : (
                String(currentRing)
              )
            }
            title={
              activePlayer
                ? `${activePlayer.name} is building the map`
                : "Map build"
            }
            description={instruction}
          >
            {ringName && <Tag tone="ion">{ringName}</Tag>}
            <Chip pressed={adminMode} onChange={handleAdminToggle}>
              Admin
            </Chip>
            {showPickForAnyoneControl && (
              <Tooltip
                label="Reveals hidden tile information. Use with caution."
                side="bottom"
              >
                {pickAnyChip}
              </Tooltip>
            )}
            {showUndoLastSelection && (
              <Button
                size="sm"
                variant="tertiary"
                icon={<IconArrowBackUp size={15} />}
                onClick={undoLastPick}
                disabled={selections.length === 0}
              >
                Undo
              </Button>
            )}
          </PhaseBanner>
          <RollingDraftOrder
            pickOrder={draft.pickOrder}
            currentPick={currentPick}
            players={hydratedPlayers}
          />
        </div>

        <div className={classes.mapArea}>
          <div className={classes.mapBox}>
            <Map
              id="texas-map"
              modifiableMapTiles={selectedSystemId ? placeableTileIndices : []}
              ringHighlightTiles={currentRingTiles}
              map={mapForRender}
              disabled={!canSelect}
              interactions={MAP_INTERACTIONS.texasBuild}
              onSelectSystemTile={handleMapTileSelect}
            />
          </div>
        </div>
      </main>

      <Modal
        opened={pendingPlacement !== null}
        onClose={() => setPendingPlacement(null)}
        title={
          pendingPlacement
            ? `Place tile ${pendingPlacement.systemId} here?`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setPendingPlacement(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmPlacement} autoFocus>
              Place tile
            </Button>
          </>
        }
      >
        {pendingPlacement && (
          <div className={classes.preview}>
            <RawSystemTile
              mapId={`texas-place-${pendingPlacement.systemId}`}
              tile={{
                idx: 0,
                type: "SYSTEM",
                systemId: pendingPlacement.systemId,
                position: { x: 0, y: 0 },
              }}
              radius={64}
              disablePopover
            />
          </div>
        )}
        {ringName && (
          <Text size="sm" tone="muted" align="center">
            {ringName}
          </Text>
        )}
      </Modal>
    </div>
  );
}
