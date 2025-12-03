import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NumberStepper } from "~/components/NumberStepper";
import { IconDice6Filled } from "@tabler/icons-react";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft } from "~/draftStore";

export function AvailableMinorFactionsSection() {
  const {
    addRandomMinorFaction,
    removeLastMinorFaction,
    randomizeMinorFactions,
    removeMinorFaction,
  } = useDraft((state) => state.actions);

  const factionPool = useDraft((state) =>
    state.factionPool.filter((f) => !state.draft.availableFactions.includes(f)),
  );
  const numFactions = useDraft(
    (state) => state.draft.settings.numMinorFactions,
  );
  const availableFactions = useDraft(
    (state) => state.draft.availableMinorFactions,
  );

  if (!numFactions || !availableFactions) return null;

  return (
    <Section>
      <SectionTitle title="Minor Faction Pool">
        <Group>
          <Button
            size="xs"
            onMouseDown={randomizeMinorFactions}
            color="gray.7"
            variant="filled"
          >
            <IconDice6Filled size={24} />
          </Button>

          <Text># factions: {numFactions}</Text>
          <NumberStepper
            decrease={removeLastMinorFaction}
            increase={addRandomMinorFaction}
            decreaseDisabled={numFactions <= 6}
            increaseDisabled={numFactions >= factionPool.length}
          />
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
            onRemove={() => removeMinorFaction(factionId)}
            removeEnabled={availableFactions.length > 6}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
