import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NumberStepper } from "~/components/NumberStepper";
import { IconDice6Filled } from "@tabler/icons-react";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft } from "~/draftStore";

export function AvailableFactionsSection() {
  const {
    addRandomFaction,
    removeLastFaction,
    randomizeFactions,
    removeFaction,
  } = useDraft((state) => state.actions);
  const numPreassignedFactions = useDraft(
    (state) => state.draft.settings.numPreassignedFactions,
  );
  const factionPool = useDraft((state) =>
    state.factionPool.filter(
      (f) => !state.draft.availableMinorFactions?.includes(f),
    ),
  );
  const { numFactions, availableFactions } = useDraft((state) => ({
    numFactions: state.draft.settings.numFactions,
    availableFactions: state.draft.availableFactions,
  }));

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
        {availableFactions.map((factionId) => (
          <NewDraftFaction
            key={factionId}
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
