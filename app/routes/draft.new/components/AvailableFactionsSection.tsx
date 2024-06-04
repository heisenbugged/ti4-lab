import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { FactionId } from "~/types";
import { allFactionIds, factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NewDraftFaction } from "./NewDraftFaction";
import { NumberStepper } from "~/components/NumberStepper";

type Props = {
  numFactions: number;
  selectedFactions: FactionId[];
  onAddFaction: () => void;
  onRemoveFaction: () => void;
  onToggleFaction: (factionId: FactionId, checked: boolean) => void;
};

export function AvailableFactionsSection({
  numFactions,
  selectedFactions,
  onRemoveFaction,
  onAddFaction,
  onToggleFaction,
}: Props) {
  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Text># factions: {numFactions}</Text>
          <NumberStepper
            decrease={onRemoveFaction}
            increase={onAddFaction}
            decreaseDisabled={numFactions <= 6}
            increaseDisabled={numFactions >= allFactionIds.length}
          />
        </Group>
      </SectionTitle>
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3, md: 4, xl: 6, xxl: 8 }}
        spacing="xs"
      >
        {selectedFactions.map((factionId) => (
          <NewDraftFaction
            key={factionId}
            faction={factions[factionId]}
            onRemove={() => onToggleFaction(factionId, false)}
            removeEnabled={selectedFactions.length > 6}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
