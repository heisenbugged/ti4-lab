import { useState } from "react";
import { Bracket, Button, Grid, Modal, Stack, Text } from "~/ui";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { useDraft } from "~/draftStore";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { TEXAS_REDRAW_VALUE } from "~/draft/texas/texasDraft";
import { SimultaneousPhaseLayout } from "../components/SimultaneousPhaseLayout";
import { FactionId } from "~/types";

type PendingChoice = FactionId | typeof TEXAS_REDRAW_VALUE;

export function TexasFactionSelectionPhase() {
  const { stageSimultaneousPick } = useSyncDraft();
  const allowRedraw =
    useDraft((state) => state.draft.settings.texasAllowFactionRedraw) !== false;
  const texasDraft = useDraft((state) => state.draft.texasDraft);
  const [pending, setPending] = useState<PendingChoice | null>(null);

  const phase = useSimultaneousPickPhase("texasFaction");
  const { currentPlayer, canSelect } = phase;

  const options =
    currentPlayer && texasDraft?.factionOptions
      ? (texasDraft.factionOptions[currentPlayer.id] ?? [])
      : [];
  const selectedFaction =
    currentPlayer && phase.stagingValues
      ? phase.stagingValues[currentPlayer.id]
      : undefined;

  const confirmPending = () => {
    const choice = pending;
    setPending(null);
    if (!choice || !currentPlayer) return;
    stageSimultaneousPick("texasFaction", currentPlayer.id, choice);
  };

  const isRedraw = pending === TEXAS_REDRAW_VALUE;
  const pendingFaction =
    pending && !isRedraw ? allFactions[pending as FactionId] : undefined;

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName="Faction selection"
      phaseColor="orange"
      description={
        allowRedraw
          ? "Select one of your dealt factions, or redraw"
          : "Select one of your dealt factions"
      }
      showPickAnyWarning
      maw={1400}
    >
      <Stack gap={4}>
        {options.length === 0 && (
          <Text size="sm" tone="muted">
            Dealt factions stay hidden until you pick for a player.
          </Text>
        )}
        <Grid cols={{ base: 1, xs: 2, lg: 3 }} gap={4}>
          {options.map((factionId) => {
            const isSelected = selectedFaction === factionId;
            return (
              <Bracket key={factionId} active={isSelected}>
                <DraftableFaction
                  faction={allFactions[factionId]}
                  selectedOverride={isSelected}
                  selectedColorOverride="green"
                  onSelect={
                    canSelect && currentPlayer
                      ? () => setPending(factionId)
                      : undefined
                  }
                />
              </Bracket>
            );
          })}
        </Grid>

        {allowRedraw && (
          <Bracket active={selectedFaction === TEXAS_REDRAW_VALUE}>
            <Button
              block
              disabled={!canSelect || !currentPlayer}
              aria-pressed={selectedFaction === TEXAS_REDRAW_VALUE}
              onClick={() => {
                if (currentPlayer) setPending(TEXAS_REDRAW_VALUE);
              }}
            >
              Discard both and redraw
            </Button>
          </Bracket>
        )}
      </Stack>

      <Modal
        opened={pending !== null}
        onClose={() => setPending(null)}
        size="sm"
        title={
          isRedraw
            ? "Discard both and redraw?"
            : pendingFaction
              ? `Select ${pendingFaction.name}?`
              : undefined
        }
        footer={
          <>
            <Button variant="tertiary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmPending} autoFocus>
              {isRedraw ? "Discard and redraw" : "Select faction"}
            </Button>
          </>
        }
      >
        <Text size="sm" tone="muted">
          {isRedraw
            ? "Discard both factions and draw one you must play?"
            : pendingFaction
              ? `Selecting faction ${pendingFaction.name}.`
              : null}
        </Text>
      </Modal>
    </SimultaneousPhaseLayout>
  );
}
