import { Box, Button, Center, Grid, SimpleGrid, Stack } from "@mantine/core";
import { SelectionOverlay } from "~/components/SelectionOverlay";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { useDraft } from "~/draftStore";
import { AdminPasswordModal } from "../components/AdminPasswordModal";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { PlayerSelectionSidebar } from "../components/PlayerSelectionSidebar";
import { SpectatorModeNotice } from "../components/SpectatorModeNotice";
import { TEXAS_REDRAW_VALUE } from "~/draft/texas/texasDraft";
import { SimultaneousPhaseHeader } from "../components/SimultaneousPhaseHeader";
import { useAdminControls } from "../components/useAdminControls";

export function TexasFactionSelectionPhase() {
  const { stageSimultaneousPick, undoStagedPick, undoSimultaneousPhase } =
    useSyncDraft();
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
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const allowRedraw =
    useDraft((state) => state.draft.settings.texasAllowFactionRedraw) !== false;
  const texasDraft = useDraft((state) => state.draft.texasDraft);

  const phase = useSimultaneousPickPhase("texasFaction");

  const options =
    phase.currentPlayer && texasDraft?.factionOptions
      ? texasDraft.factionOptions[phase.currentPlayer.id] ?? []
      : [];
  const selectedFaction =
    phase.currentPlayer && phase.stagingValues
      ? phase.stagingValues[phase.currentPlayer.id]
      : undefined;

  const isSpectatorMode = selectedPlayer === -1;

  const hasAnyStagedSelections =
    !!phase.stagingValues && Object.keys(phase.stagingValues).length > 0;
  const canUndoPick = phase.currentPlayer
    ? phase.stagingValues?.[phase.currentPlayer.id] !== undefined
    : false;

  const handleUndoPick = async () => {
    if (!phase.currentPlayer) return;
    if (confirm("Undo the staged pick for this player?")) {
      await undoStagedPick("texasFaction", phase.currentPlayer.id);
    }
  };

  const handleUndoPhase = async () => {
    if (
      confirm(
        "Undo this phase? This clears all staged picks and moves back one step.",
      )
    ) {
      await undoSimultaneousPhase("texasFaction");
    }
  };

  return (
    <Box mih="100vh">
      <AdminPasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
      />

      <SimultaneousPhaseHeader
        phaseName="Faction Selection"
        phaseColor="orange"
        description={
          allowRedraw
            ? "Select a faction or redraw"
            : "Select one of your dealt factions"
        }
        adminMode={adminMode}
        onAdminToggle={handleAdminToggle}
        showPickForAnyoneControl={showPickForAnyoneControl}
        pickForAnyone={pickForAnyone}
        onTogglePickForAnyone={() => setPickForAnyone(!pickForAnyone)}
        showUndo={showUndoLastSelection}
        onUndoPick={handleUndoPick}
        onUndoPhase={handleUndoPhase}
        undoPickDisabled={!canUndoPick}
        undoPhaseDisabled={!hasAnyStagedSelections && selections.length === 0}
        showPickAnyWarning={true}
      />

      <SpectatorModeNotice isSpectatorMode={isSpectatorMode} />

      {/* Main content */}
      <Center p="md" pt="lg">
        <Grid maw={1400} w="100%" gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <PlayerSelectionSidebar
              players={phase.hydratedPlayers}
              pickForAnyone={phase.pickForAnyone}
              selectedPlayerId={phase.selectedPlayerId}
              defaultPlayerId={phase.defaultPlayerId}
              stagingValues={phase.stagingValues}
              onPlayerSelect={phase.setSelectedPlayerId}
              onPlayerHover={phase.setHoveredPlayerId}
              currentPlayerId={phase.currentPlayer?.id}
              spectatorMode={isSpectatorMode}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                {options.map((factionId) => {
                  const isSelected = selectedFaction === factionId;
                  return (
                    <Box
                      key={factionId}
                      style={{
                        position: "relative",
                        border: isSelected
                          ? "3px solid var(--mantine-color-green-6)"
                          : "3px solid transparent",
                        borderRadius: "var(--mantine-radius-md)",
                      }}
                    >
                      <DraftableFaction
                        faction={allFactions[factionId]}
                        selectedOverride={isSelected}
                        selectedColorOverride="green"
                        onSelect={
                          phase.canSelect && phase.currentPlayer
                            ? () => {
                                const currentPlayer = phase.currentPlayer;
                                if (!currentPlayer) return;
                                if (
                                  confirm(
                                    `Selecting faction ${allFactions[factionId].name}`,
                                  )
                                ) {
                                  stageSimultaneousPick(
                                    "texasFaction",
                                    currentPlayer.id,
                                    factionId,
                                  );
                                }
                              }
                            : undefined
                        }
                      />
                      <SelectionOverlay visible={isSelected} size="md" />
                    </Box>
                  );
                })}
              </SimpleGrid>

              {allowRedraw && (
                <Button
                  variant="light"
                  color="gray"
                  size="md"
                  disabled={!phase.canSelect || !phase.currentPlayer}
                  onClick={() => {
                    if (
                      confirm(
                        "Discard both factions and draw one you must play?",
                      )
                    ) {
                      stageSimultaneousPick(
                        "texasFaction",
                        phase.currentPlayer!.id,
                        TEXAS_REDRAW_VALUE,
                      );
                    }
                  }}
                  style={{
                    border:
                      selectedFaction === TEXAS_REDRAW_VALUE
                        ? "3px solid var(--mantine-color-green-6)"
                        : undefined,
                  }}
                >
                  Discard Both &amp; Redraw
                </Button>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Center>
    </Box>
  );
}
