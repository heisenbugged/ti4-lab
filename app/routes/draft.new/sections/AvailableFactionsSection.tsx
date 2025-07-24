import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NumberStepper } from "~/components/NumberStepper";
import { IconDice6Filled, IconSettings } from "@tabler/icons-react";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft, useHasBanPhase } from "~/draftStore";

export function AvailableFactionsSection() {
  const {
    addRandomFaction,
    removeLastFaction,
    randomizeFactions,
    removeFaction,
    openFactionSettings,
  } = useDraft((state) => state.actions);

  const hasBanPhase = useHasBanPhase();

  const numPreassignedFactions = useDraft(
    (state) => state.draft.settings.numPreassignedFactions,
  );
  const factionPool = useDraft((state) =>
    (state.allowedFactions ?? state.factionPool).filter(
      (f) => !state.draft.availableMinorFactions?.includes(f),
    ),
  );

  const { numFactions, availableFactions } = useDraft((state) => ({
    numFactions: state.draft.settings.numFactions,
    availableFactions: state.draft.availableFactions,
  }));

  if (hasBanPhase) {
    return (
      <Section>
        <SectionTitle title="Faction Pool">
          <Group>
            <Text># factions: {numFactions}</Text>
            {/* cannot change number of factions if using 'bag draft' method */}
            {numPreassignedFactions === undefined && (
              <NumberStepper
                decrease={removeLastFaction}
                increase={addRandomFaction}
                decreaseDisabled={numFactions <= 6}
                increaseDisabled={numFactions >= factionPool.length}
              />
            )}
          </Group>
        </SectionTitle>

        <Text c="dimmed">
          Factions pool will be made during the draft after the ban phase
        </Text>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Button
            size="xs"
            onMouseDown={randomizeFactions}
            color="gray.7"
            variant="filled"
          >
            <IconDice6Filled size={24} />
          </Button>

          <Button
            size="xs"
            onMouseDown={openFactionSettings}
            color="gray.7"
            variant="filled"
          >
            <IconSettings size={24} />
          </Button>

          <Text># factions: {numFactions}</Text>
          {/* cannot change number of factions if using 'bag draft' method */}
          {numPreassignedFactions === undefined && (
            <NumberStepper
              decrease={removeLastFaction}
              increase={addRandomFaction}
              decreaseDisabled={numFactions <= 6}
              increaseDisabled={numFactions >= factionPool.length}
            />
          )}
        </Group>
      </SectionTitle>
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3, md: 4, xl: 6, xxl: 8 }}
        spacing="xs"
      >
        {availableFactions.map((factionId, idx) => (
          <NewDraftFaction
            key={`${factionId}-${idx}`}
            faction={factions[factionId]}
            onRemove={
              numPreassignedFactions === undefined
                ? () => removeFaction(factionId)
                : undefined
            }
            removeEnabled={availableFactions.length > 6}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
