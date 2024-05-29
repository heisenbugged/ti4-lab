import { Button, Group, Input, SimpleGrid, Text } from "@mantine/core";
import { FactionId } from "~/types";
import { factionIds, factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NewDraftFaction } from "./NewDraftFaction";

type Props = {
  numFactions: number;
  selectedFactions: FactionId[];
  onAddFaction: () => void;
  onRemoveFaction: () => void;
  onChangeNumFactions: (num: number | undefined) => void;
  onToggleFaction: (factionId: FactionId, checked: boolean) => void;
};

export function AvailableFactionsSection({
  numFactions,
  selectedFactions,
  onRemoveFaction,
  onAddFaction,
  onChangeNumFactions,
  onToggleFaction,
}: Props) {
  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Text># of factions in draft: {numFactions}</Text>
          <Group gap={2}>
            <Button
              size="compact-md"
              color="red"
              variant="filled"
              disabled={numFactions <= 6}
              onMouseDown={onRemoveFaction}
            >
              -
            </Button>
            <Button
              size="compact-md"
              color="green"
              variant="filled"
              onMouseDown={onAddFaction}
            >
              +
            </Button>
          </Group>
        </Group>
      </SectionTitle>
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3, md: 6, xl: 8, xxl: 8 }}
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
