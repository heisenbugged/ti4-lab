import { AppShell, Box, Button, Group, Modal, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import { Map } from "~/components/Map";
import { useMediaQuery } from "@mantine/hooks";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { RollingDraftOrder } from "../components/RollingDraftOrder";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { getCurrentPlaceableRing, getPlaceableTileIndices } from "~/utils/texasMapBuild";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { systemData } from "~/data/systemData";
import { IconArrowBackUp } from "@tabler/icons-react";
import { SystemTileCard } from "~/components/SystemTileCard";
import { useAdminControls } from "../components/useAdminControls";
import classes from "./TexasMapBuildPhase.module.css";

const SIDEBAR_WIDTH = 180;

export function TexasMapBuildPhase() {
  const draft = useDraft((state) => state.draft);
  const { placeTexasTile } = useDraft((state) => state.draftActions);
  const { syncDraft, undoLastPick } = useSyncDraft();
  const { hydratedPlayers, hydratedMap, currentPick, activePlayer, currentlyPicking } =
    useHydratedDraft();
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
  const isMobile = useMediaQuery("(max-width: 48em)");
  const mobileFooterHeight = 160;

  const handleUndo = async () => {
    if (confirm("Are you sure you want to undo the last selection?")) {
      await undoLastPick();
    }
  };

  const playerTiles =
    activePlayer && draft.texasDraft?.playerTiles
      ? draft.texasDraft.playerTiles[activePlayer.id] ?? []
      : [];

  const mapForRender = hydratedMap ?? draft.presetMap;
  const currentRing = getCurrentPlaceableRing(mapForRender);
  const ringNames = {
    1: "First Ring",
    2: "Second Ring",
    3: "Third Ring",
    4: "Fourth Ring",
  } as const;

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

  const canSelect = pickForAnyone || (currentlyPicking && selectedPlayer !== undefined);

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
    placeTexasTile(activePlayer.id, pendingPlacement.tileIdx, pendingPlacement.systemId);
    syncDraft();
    setPendingPlacement(null);
    setSelectedSystemId(null);
  };

  return (
    <AppShell
      navbar={{
        width: SIDEBAR_WIDTH,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding={0}
    >
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <AppShell.Navbar p={0} visibleFrom="sm">
        <Box h="calc(100vh - 60px)" style={{ display: "flex", flexDirection: "column" }}>
          <Box className={classes.sidebarHeader} px="md" pt="sm" pb="xs">
            <Text size="sm" fw={700} mb="xs">
              {activePlayer?.name ?? "Waiting"}
            </Text>
            <Text size="xs" fw={600} tt="uppercase" className={classes.mutedLabel} mb="xs">
              Available Tiles ({sortedPlayerTiles.length}/5)
            </Text>
          </Box>

          <Box px="md" py="sm" style={{ overflowY: "auto", flex: "1 1 auto" }}>
            <TilePickerList
              tiles={sortedPlayerTiles}
              selectedSystemId={selectedSystemId}
              onSelect={handleSelectTile}
              disabled={!canSelect}
            />
          </Box>
        </Box>
      </AppShell.Navbar>
      <AppShell.Footer
        p="xs"
        hiddenFrom="sm"
        className={classes.footer}
        style={{ height: mobileFooterHeight }}
      >
        <ScrollArea
          type="auto"
          scrollbarSize={8}
          offsetScrollbars
          style={{ whiteSpace: "nowrap", height: "100%" }}
        >
          <TilePickerList
            tiles={sortedPlayerTiles}
            selectedSystemId={selectedSystemId}
            onSelect={handleSelectTile}
            disabled={!canSelect}
            compact={true}
          />
        </ScrollArea>
      </AppShell.Footer>
      <AppShell.Main
        p={0}
        h={
          isMobile
            ? `calc(100vh - 60px - ${mobileFooterHeight}px)`
            : "calc(100vh - 60px)"
        }
        mih={
          isMobile
            ? `calc(100vh - 60px - ${mobileFooterHeight}px)`
            : "calc(100vh - 60px)"
        }
        style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        <Box className={classes.topBar} style={{ flexShrink: 0 }}>
          <Group justify="space-between" align="center" px="sm" py={8}>
            <Group gap="xs">
              <Text
                size="xs"
                fw={700}
                tt="uppercase"
                style={{
                  letterSpacing: "0.05em",
                  color: "var(--mantine-color-blue-4)",
                }}
              >
                {ringNames[currentRing as 1 | 2 | 3 | 4]}
              </Text>
              <Text size="xs" c="dimmed" ff="monospace">
                {activePlayer?.name ?? "Waiting"}
              </Text>
            </Group>
            <Group gap={4}>
              <Button
                size="compact-xs"
                variant={adminMode ? "filled" : "default"}
                color={adminMode ? "violet" : "gray"}
                onClick={handleAdminToggle}
              >
                Admin
              </Button>
              {showPickForAnyoneControl && (
                <Tooltip
                  label="Reveals hidden tile information. Use with caution."
                  color="orange"
                  withArrow
                  position="bottom"
                >
                  <Button
                    size="compact-xs"
                    variant={pickForAnyone ? "filled" : "default"}
                    color={pickForAnyone ? "orange" : "gray"}
                    onClick={() => setPickForAnyone(!pickForAnyone)}
                  >
                    Pick Any
                  </Button>
                </Tooltip>
              )}
              {showUndoLastSelection && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconArrowBackUp size={12} />}
                  onClick={handleUndo}
                  disabled={selections.length === 0}
                >
                  Undo
                </Button>
              )}
            </Group>
          </Group>
          <Box px="sm" pb="sm" pt={4}>
            <RollingDraftOrder
              pickOrder={draft.pickOrder}
              currentPick={currentPick}
              players={hydratedPlayers}
            />
          </Box>
        </Box>

        <Box
          w="100%"
          pos="relative"
          pt="md"
          pb="md"
          style={{
            flex: "1 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            pos="relative"
            style={{
              aspectRatio: "740 / 800",
              height: "100%",
              maxWidth: "100%",
              minHeight: 450,
            }}
          >
            <Map
              id="texas-map"
              modifiableMapTiles={selectedSystemId ? placeableTileIndices : []}
              ringHighlightTiles={currentRingTiles}
              map={mapForRender}
              editable={false}
              disabled={!canSelect}
              droppable={true}
              onSelectSystemTile={handleMapTileSelect}
            />
          </Box>
        </Box>
      </AppShell.Main>
      <Modal
        opened={pendingPlacement !== null}
        onClose={() => setPendingPlacement(null)}
        title="Confirm placement"
        centered
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            confirmPlacement();
          }
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            Place tile {pendingPlacement?.systemId} here?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingPlacement(null)}>
              Cancel
            </Button>
            <Button color="green" onClick={confirmPlacement}>
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}

function SelectableSystemTile({
  systemId,
  selected,
  disabled,
  onSelect,
}: {
  systemId: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (systemId: string) => void;
}) {
  const tileType = systemData[systemId]?.type;
  const faceDownColor = tileType === "RED" ? "red" : "blue";

  return (
    <SystemTileCard
      systemId={systemId}
      radius={56}
      padding={8}
      selected={selected}
      faceDown={!!disabled}
      faceDownColor={faceDownColor}
      onClick={disabled ? undefined : () => onSelect(systemId)}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}

function TilePickerList({
  tiles,
  selectedSystemId,
  onSelect,
  disabled,
  compact = false,
}: {
  tiles: string[];
  selectedSystemId: string | null;
  onSelect: (systemId: string) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Group gap="sm" wrap="nowrap">
        {tiles.map((systemId) => (
          <Box key={`mobile-${systemId}`} style={{ display: "inline-block" }}>
            <SelectableSystemTile
              systemId={systemId}
              selected={selectedSystemId === systemId}
              onSelect={onSelect}
              disabled={disabled}
            />
          </Box>
        ))}
      </Group>
    );
  }

  return (
    <Box>
      {tiles.map((systemId) => (
        <Box key={systemId} mb="sm">
          <SelectableSystemTile
            systemId={systemId}
            selected={selectedSystemId === systemId}
            onSelect={onSelect}
            disabled={disabled}
          />
        </Box>
      ))}
    </Box>
  );
}
