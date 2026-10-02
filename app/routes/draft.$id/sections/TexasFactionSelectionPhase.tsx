import { Box, Button, SimpleGrid, Stack } from "@mantine/core";
import { SelectionOverlay } from "~/components/SelectionOverlay";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useSimultaneousPickPhase } from "~/hooks/useSimultaneousPickPhase";
import { useDraft } from "~/draftStore";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { TEXAS_REDRAW_VALUE } from "~/draft/texas/texasDraft";
import { SimultaneousPhaseLayout } from "../components/SimultaneousPhaseLayout";

export function TexasFactionSelectionPhase() {
  const { stageSimultaneousPick } = useSyncDraft();
  const allowRedraw =
    useDraft((state) => state.draft.settings.texasAllowFactionRedraw) !== false;
  const texasDraft = useDraft((state) => state.draft.texasDraft);

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

  return (
    <SimultaneousPhaseLayout
      phase={phase}
      phaseName="Faction Selection"
      phaseColor="orange"
      description={
        allowRedraw
          ? "Select a faction or redraw"
          : "Select one of your dealt factions"
      }
      showPickAnyWarning
      maw={1400}
      sidebarSpan={{ base: 12, md: 4 }}
      contentSpan={{ base: 12, md: 8 }}
    >
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
                    canSelect && currentPlayer
                      ? () => {
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
            disabled={!canSelect || !currentPlayer}
            onClick={() => {
              if (
                currentPlayer &&
                confirm("Discard both factions and draw one you must play?")
              ) {
                stageSimultaneousPick(
                  "texasFaction",
                  currentPlayer.id,
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
    </SimultaneousPhaseLayout>
  );
}
