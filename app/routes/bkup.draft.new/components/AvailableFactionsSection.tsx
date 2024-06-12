import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { FactionId } from "~/types";
import { allFactionIds, factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NewDraftFaction } from "./NewDraftFaction";
import { NumberStepper } from "~/components/NumberStepper";
import { IconDice6Filled } from "@tabler/icons-react";

type Props = {
  numFactions: number;
  selectedFactions: FactionId[];
  factionPool: FactionId[];
  onAddFaction: () => void;
  onRemoveFaction: () => void;
  onToggleFaction: (factionId: FactionId, checked: boolean) => void;
  onRandomizeFactions: () => void;
};

export function AvailableFactionsSection({
  numFactions,
  selectedFactions,
  factionPool,
  onRemoveFaction,
  onAddFaction,
  onToggleFaction,
  onRandomizeFactions,
}: Props) {
  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Button
            size="xs"
            onMouseDown={onRandomizeFactions}
            color="gray.7"
            variant="filled"
          >
            <IconDice6Filled size={24} />
          </Button>

          <Text># factions: {numFactions}</Text>
          <NumberStepper
            decrease={onRemoveFaction}
            increase={onAddFaction}
            decreaseDisabled={numFactions <= 6}
            increaseDisabled={numFactions >= factionPool.length}
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
